import { Component, inject, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SET_FORM_RATING_MODEL } from '../../../../modules/client-dashboard.interfaces';
import { MessageService } from 'primeng/api';
import { ClientDashboardService } from '../../../../services/client-dashboard.service';
import { Avatar } from 'primeng/avatar';
import { StarRatingDisplayComponent } from '../../../../shared/star-rating-display/star-rating-display.component';

@Component({
  selector: 'app-rating-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    RatingModule,
    MessageModule,
    ButtonModule,
    TooltipModule,
    Avatar,
    StarRatingDisplayComponent    

  ],
  templateUrl: './rating-dialog.component.html',
  styleUrl: './rating-dialog.component.scss'
})
export class RatingDialogComponent {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);
  private clientDashboardService = inject(ClientDashboardService);
  


  visibleRatingDialog = model<boolean>(false);
  onSavedRatingDialog = output<void>();
  onCancelRatingDialog = output<void>();

  setFormRating!: FormGroup<SET_FORM_RATING_MODEL>

  readOnly = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  constructor(){
    this.setFormRating = this.fb.group<SET_FORM_RATING_MODEL>({
      rating: this.fb.control(null, [Validators.required]),
      barber_rating_count: this.fb.control(null),
      barber_rating: this.fb.control(null),
      barber_id: this.fb.control(null),
      barber_name: this.fb.control(null),
      appointment_id: this.fb.control(null),
      barber_avatar_url:  this.fb.control(null),
    },{updateOn:'submit'})

  }

  loadAppointmentDetails(appId:number){
    this.setFormRating.reset();
    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {
        this.readOnly.set(!!response.appointment_barber_rating);
        this.setFormRating.patchValue(
          {
            barber_name: response.barber_name,
            barber_id: response.barber_id,
            appointment_id: response.appointment_id,
            barber_rating_count: response.barber_rating_count,
            barber_rating: response.barber_rating_avg,
            rating: response.appointment_barber_rating,
            barber_avatar_url:  response?.barber_avatar_url,
        });
      },
      error: (err) => {
        console.log("==|| getAppointmentDetails ||== err == ", err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });

      }
    })
  }


  onSetAppointmentRating(){
    console.log("==|| onSetAppointmentRating ||== fsrv ==", this.fsrv)
    this.fsrc.rating.markAsTouched();
    if(this.setFormRating.invalid) return;
    this.isSaving.set(true);
    const {appointment_id, barber_id, rating} = this.fsrv
    this.clientDashboardService.setBarberRate(appointment_id as number, barber_id as number, rating as number).subscribe({
      next: (response) => {

        console.log("==|| setBarberRate ||== response == ", response);

        this.messageService.add({ 
          severity: 'info', 
          summary: 'Recenzie adaugata', 
          detail: response.message,
          life: 4000 
        });
  
        this.isSaving.set(false);
        this.onSavedRatingDialog.emit();  
        this.visibleRatingDialog.set(false);


      },
      error: (err) => {

        console.log("==|| setBarberRate ||== err == ", err);

        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare la adaugarea recenziei', 
          detail: err.error?.message || 'Nu s-a putut efectua adaugarea recenziei.' 
        });
        this.isSaving.set(false);
      }
    });

  }
  

  get fsrv(){
    return this.setFormRating.value;
  }
  get fsrc(){
    return this.setFormRating.controls;
  }


}
