import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AdminBarbersService } from '../../../../services/admin-barbers.service';
import { SCHEDULE_DAY_FORM_MODEL } from '../../../../modules/admin-barbers.interfaces';
import { scheduleHoursValidator } from '@validators/index';

@Component({
  selector: 'app-set-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputText,
    Message,

  ],
  templateUrl: './set-schedule-dialog.component.html',
  styleUrl: './set-schedule-dialog.component.scss'
})
export class SetScheduleDialogComponent {
  private fb = inject(FormBuilder);
  private adminBarbersService = inject(AdminBarbersService);
  private messageService = inject(MessageService);


  visibleScheduleDialog = model<boolean>(false);
  onSavedSchedule = output<void>();
  onCancelSchedule = output<void>();

  barberName = input<string | null>(null);
  barber_id: number | null = null;

  scheduleForm!: FormGroup;

  // Indexarea zilelor corespunde cu targetDate.getDay() (0 = Duminică, 1 = Luni...)
  daysLabels: string[] = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];



  constructor(){
    this.scheduleForm = this.fb.group({
      days: this.fb.array([])
    });


  }

  getBarberSchedule(barberId: number){
    // const baseSchedule: SCHEDULE_DAY_FORM_MODEL[] = Array.from({ length: 7 }, (_, i) => ({
    //   day_of_week: i,
    //   start_hour: '09:00',
    //   end_hour: '18:00',
    //   is_active: i !== 0 && i !== 6 // Implicit: Luni-Vineri activ, Sâmbătă-Duminică liber
    // }));

    const baseSchedule: SCHEDULE_DAY_FORM_MODEL[] = Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_hour: '09:00',
      end_hour: '18:00',
      is_active: false
    }));
    
    this.barber_id = barberId;
     
    this.adminBarbersService.getBarberSchedule(barberId).subscribe({
      next: (response: any) => {
        let finalData: SCHEDULE_DAY_FORM_MODEL[] = [];

        if (response?.data?.length > 0) {
          finalData = baseSchedule.map(baseDay => {
            const match = response.data.find((s: any) => s.day_of_week === baseDay.day_of_week);
            return match 
              ? { day_of_week: baseDay.day_of_week, start_hour: match.start_hour, end_hour: match.end_hour, is_active: true }
              : { ...baseDay, is_active: false };
          });
        } else {
          finalData = baseSchedule;
          // finalData = []
        }

        // Populam dinamic FormArray-ul
        this.populateScheduleForm(finalData);
        // this.displayScheduleDialog = true;
      },
      error: () => {
        this.populateScheduleForm(baseSchedule);
        // this.displayScheduleDialog = true;
      }
    });
  }

    // Reconstruiește controalele din FormArray la fiecare deschidere a modalei
  private populateScheduleForm(daysData: SCHEDULE_DAY_FORM_MODEL[]) {
    this.daysFormArray.clear(); // șterge datele vechi

    daysData.forEach(day => {
      const dayGroup = this.fb.group({
        day_of_week: [day.day_of_week],
        is_active: [day.is_active],
        start_hour: [day.start_hour, Validators.required],
        end_hour: [day.end_hour, Validators.required]
      }, {
        validators: scheduleHoursValidator() // aplicăm validatorul pe fiecare zi
      });

      this.daysFormArray.push(dayGroup);
    });
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      // Identificăm rândul cu probleme pentru a trimite un mesaj clar de eroare
      const invalidDayIndex = this.daysFormArray.controls.findIndex(ctrl => ctrl.hasError('invalidHours'));
      
      if (invalidDayIndex !== -1) {
        const dayNum = this.daysFormArray.at(invalidDayIndex).get('day_of_week')?.value;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Validare orar', 
          detail: `Ora de început trebuie să fie mai mică decât ora de sfârșit pentru ziua de ${this.daysLabels[dayNum]}.` 
        });
      }
      return;
    }

    // Extragem datele curate direct din formular
    const schedulePayload = this.daysFormArray.getRawValue();
    console.log("==|| saveSchedule || == this.daysFormArray ==", this.daysFormArray)
    console.log("==|| saveSchedule || == schedulePayload ==", schedulePayload)

    this.adminBarbersService.saveBarberSchedule(this.barber_id as number, schedulePayload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Orar Actualizat', detail: res.message });
        // this.displayScheduleDialog = false;
        this.onSavedSchedule.emit();
        this.visibleScheduleDialog.set(false); 

        // this.loadBarbersLazy({ first: table.first ?? 0, rows: table.rows ?? 10 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare tehnică la salvarea orarului.' });
      }
    });
  }
  

  get daysFormArray() {
    return this.scheduleForm.get('days') as FormArray<FormGroup>;
  }

}
