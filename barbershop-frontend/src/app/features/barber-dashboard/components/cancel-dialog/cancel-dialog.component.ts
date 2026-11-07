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
import { BARBER_APPOINTMENTS_LIST_ITEM, SET_FORM_MODEL_CANCELLED_APP } from '../../../../modules/barber-dashboard.interfaces';

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
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
  templateUrl: './cancel-dialog.component.html',
  styleUrl: './cancel-dialog.component.scss'
})
export class CancelDialogComponent {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);

  visibleCancelDialog = model<boolean>(false);

  appointment = input<BARBER_APPOINTMENTS_LIST_ITEM | null>(null);

  onSet = output<void>();
  onCancel = output<void>();


  setFormCancelledApp!: FormGroup<SET_FORM_MODEL_CANCELLED_APP>
  

  readOnly = signal<boolean>(false);
  isSavingCancelStatus = signal<boolean>(false);

  constructor(){
    this.setFormCancelledApp = this.fb.group<SET_FORM_MODEL_CANCELLED_APP>({
      appointment_id: this.fb.control(null),
      appointment_status: this.fb.control(null),
      barber_name: this.fb.control(null),
      cancel_reason: this.fb.control(null, [Validators.required, Validators.maxLength(500)]),
      customer_name: this.fb.control(null)
    })
  }

  loadAppointmentDetails(appId: number){
    this.setFormCancelledApp.reset();

    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {

        console.log("==|| complete dialog ||== apointment details ==", response)
        // this.readOnly = !!response?.customer_cancel_reason || !!response?.admin_cancel_reason;
        
        this.setFormCancelledApp.patchValue({
          appointment_id: response.appointment_id,
          appointment_status: response.appointment_status,
          barber_name: response.barber_name,
          cancel_reason: response?.customer_cancel_reason || response?.admin_cancel_reason,
          customer_name: response.customer_name
        });
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
        this.visibleCancelDialog.set(false);
      }
    });
    
  }

  onSetAppointmentCanceled(): void{
    if (this.setFormCancelledApp.invalid) {
      return;
    }

    this.isSavingCancelStatus.set(true);

    const {appointment_id, cancel_reason} = this.fscav
    this.commonService.setCancelAppointment(appointment_id as number, cancel_reason as string).subscribe({
      next: (response) => {

        console.log("==|| setCancelAppointment ||== response == ", response);

        this.messageService.add({ 
          severity: 'info', 
          summary: 'Programare Anulata', 
          detail: response.message,
          life: 4000 
        });

        this.isSavingCancelStatus.set(false);
        this.visibleCancelDialog.set(false);
        this.onSet.emit(); 

      },
      error: (err) => {

        console.log("==|| setAppointmentCompleted ||== err == ", err);

        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare la schimbarea statusului', 
          detail: err.error?.message || 'Nu s-a putut efectua schimbarea statusului programarii.' 
        });

        this.isSavingCancelStatus.set(false);

      }
    });


  }


  get fscav(){
    return this.setFormCancelledApp.value;
  }

  get fscac(){
    return this.setFormCancelledApp.controls;
  }


}
