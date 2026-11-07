import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Message, MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../services/common.service';
import { MessageService } from 'primeng/api';
import { BARBER_APPOINTMENTS_LIST_ITEM, SET_FORM_MODEL } from '../../../../modules/barber-dashboard.interfaces';
import { AdminDashboardService } from '../../../../services/admin-dashboard.service';

@Component({
  selector: 'app-complete-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextareaModule,
    MessageModule,
    TooltipModule,
    DialogModule,
    ButtonModule,
    Message

  ],
  templateUrl: './complete-dialog.component.html',
  styleUrl: './complete-dialog.component.scss'
})
export class CompleteDialogComponent {

  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);
  private adminDashboardService = inject(AdminDashboardService); 
  

  visibleCompleteDialog = model<boolean>(false);
  
  appointment = input<BARBER_APPOINTMENTS_LIST_ITEM | null>(null);

  onSet = output<void>();

  setForm!: FormGroup<SET_FORM_MODEL>

  readOnly = signal<boolean>(false);
  isSavingCompleteStatus = signal<boolean>(false);

    constructor(){
    this.setForm = this.fb.nonNullable.group<SET_FORM_MODEL>({
      customer_name: this.fb.control(null),
      appointment_id: this.fb.control(null),
      appointment_overview: this.fb.control(null, [Validators.maxLength(500)]),
      appointment_status: this.fb.control(null)
    })

  }

  loadAppointmentDetails(appId: number){
    this.setForm.reset();

    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {

        console.log("==|| complete dialog ||== apointment details ==", response)
        // this.readOnly = !!response.appointment_customer_rating;
        
        this.setForm.patchValue({
          customer_name: response.customer_name,
          appointment_id: response.appointment_id,
          appointment_overview: response.appointment_overview,
          appointment_status: response.appointment_status,
        });
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
        this.visibleCompleteDialog.set(false);
      }
    });
    
  }

  onSetAppointmentCompleted(): void{

    if (this.setForm.invalid) {
      return;
    }

    this.isSavingCompleteStatus.set(true);

    const {appointment_id, appointment_overview} = this.fsv

    console.log("==|| setAppointmentCompleted ||== this.fsv == ", this.fsv);

    this.commonService.setAppointmentCompleted(appointment_id as number, appointment_overview as string).subscribe({
      next: (response) => {

        console.log("==|| setAppointmentCompleted ||== response == ", response);

        this.messageService.add({ 
          severity: 'info', 
          summary: 'Programare Finalizata', 
          detail: response.message,
          life: 4000 
        });

        this.isSavingCompleteStatus.set(false);
        this.visibleCompleteDialog.set(false);
        
        this.onSet.emit();   

      },
      error: (err) => {

        console.log("==|| setAppointmentCompleted ||== err == ", err);

        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare la schimbarea statusului', 
          detail: err.error?.message || 'Nu s-a putut efectua schimbarea statusului programarii.' 
        });
        // this.loading.set(false);
        this.isSavingCompleteStatus.set(false);

      }
    });
  }
  

  get fsc(){
    return this.setForm.controls;
  }

  get fsv(){
    return this.setForm.value;
  }


}
