import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../services/common.service';
import { SET_FORM_MODEL } from '../../../../modules/client-dashboard.interfaces';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-cancel-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    MessageModule,
    ButtonModule,
    TooltipModule,   
    TextareaModule,
    Avatar

  ],
  templateUrl: './cancel-dialog.component.html',
  styleUrl: './cancel-dialog.component.scss'
})
export class CancelDialogComponent {
  private fb = inject(FormBuilder); 
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);
  

  visible = model<boolean>(false);
  onSaved = output<void>();
  onCancel = output<void>();

  setForm!: FormGroup<SET_FORM_MODEL>
  readOnly = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  constructor(){
    this.setForm = this.fb.nonNullable.group<SET_FORM_MODEL>({
      appointment_id: this.fb.control(null),
      barber_name: this.fb.control(null),
      appointment_status: this.fb.control(null),
      cancel_reason: this.fb.control(null, [Validators.maxLength(500), Validators.required]),
      customer_name: this.fb.control(null), 
      barber_avatar_url: this.fb.control(null)
    },{updateOn:'submit'})
  }

  loadAppointmentDetails(appId: number){
    this.setForm.reset();
    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {
        console.log("getAppointmentDetails ||== response ==|| ", response)
        response.appointment_status === 'cancelled' ? this.readOnly.set(true) : this.readOnly.set(false);
        // this.readOnly.set(!!response.appointment_customer_rating);
        this.setForm.patchValue(
          { 
            appointment_id: response.appointment_id,
            barber_name: response.barber_name,
            appointment_status: response.appointment_status,
            cancel_reason: response.customer_cancel_reason,
            barber_avatar_url: response?.barber_avatar_url
          });

      },
      error: (err) => {
        console.log("==|| showCanceledAppointmentInfo ||== err == ", err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });

      }
    })
  }

  onSetAppointmentCanceled(){

    if (this.setForm.invalid) return;

    this.isSaving.set(true);


    const {appointment_id, cancel_reason} = this.fsv

    this.commonService.setCancelAppointment(appointment_id as number, cancel_reason as string).subscribe({
      next: (response) => {

        console.log("==|| setCancelAppointment ||== response == ", response);

        this.messageService.add({ 
          severity: 'info', 
          summary: 'Programare Anulata', 
          detail: response.message,
          life: 4000 
        });

        this.isSaving.set(false);
        this.onSaved.emit();
        this.visible.set(false); 

      },
      error: (err) => {

        console.log("==|| setCancelAppointment ||== err == ", err);

        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare la schimbarea statusului', 
          detail: err.error?.message || 'Nu s-a putut efectua schimbarea statusului programarii.' 
        });
        this.isSaving.set(false);
      }
    });
  }

  get fsv(){
    return this.setForm.value;
  }
  get fsc(){
    return this.setForm.controls;
  }


}
