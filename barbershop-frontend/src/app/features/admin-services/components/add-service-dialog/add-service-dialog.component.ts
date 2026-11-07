import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SERVICES_LIST_ITEM, SET_FORM_MODEL } from '../../../../modules/admin-services.interface';
import { specialCharactersValidator } from '@validators/special-characters.validator';
import { AdminServicesService } from '../../../../services/admin-services.service';

@Component({
  selector: 'app-add-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputText,
    Message
  ],
  templateUrl: './add-service-dialog.component.html',
  styleUrl: './add-service-dialog.component.scss'
})
export class AddServiceDialogComponent {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private adminServicesService = inject(AdminServicesService);

  visible = model<boolean>(false);
  onSaved = output<void>();
  onCancel = output<void>();

  isSavingService = signal<boolean>(false);
  isEditModeDialog = input<boolean>(false);

  setForm!: FormGroup<SET_FORM_MODEL>

  constructor(){
    this.setForm = this.fb.group<SET_FORM_MODEL>({
      id: this.fb.control(null),
      name: this.fb.control(null, [Validators.required, specialCharactersValidator()]),
      price: this.fb.control(null, [Validators.required]),
      duration_minutes: this.fb.control(null, [Validators.required]),
      is_active: this.fb.control(null),
    },{updateOn: 'submit'})

  }

  getServiceDetails(serviceId: number){
    this.adminServicesService.getServiceDetails(serviceId).subscribe({
      next: (response) => {
        console.log("== || AddServiceDialogComponent || == getServiceDetails ==", response);
        this.setForm.patchValue({
          id: response.service_id,
          name: response.service_name,
          price: response.price,
          duration_minutes: response.duration_minutes,
          is_active: response.is_active
        })
      },
      error: (err) => {
        console.log("==|| getServiceDetails ||== err == ", err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
      }
    })
  }


  saveService(): void {

    if (this.setForm.invalid) {
      return;
    }

    this.isSavingService.set(true);


    const servicePayLoad = this.fsv as SERVICES_LIST_ITEM;

    this.adminServicesService.upsertService(servicePayLoad).subscribe({
      next: (response) => {

        console.log("== || upsertService || == response TS == ", response)

        if (response.success) {
          // Afișăm mesajul de succes din DB: 'inregistrarea a fost salvata/actualizata cu succes'
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succes', 
            detail: response.message 
          });
          
          this.isSavingService.set(false);
          this.onSaved.emit();
          this.visible.set(false);
        } else {
          // Afișăm mesajul de eroare din DB
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Eroare', 
            detail: response.message 
          });

          this.isSavingService.set(false);
        }
      },
      error: (err) => {
        console.error('Eroare de rețea la salvarea serviciului:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare Critică', 
          detail: 'A apărut o eroare la salvarea înregistrării' 
        });

        this.isSavingService.set(false);
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
