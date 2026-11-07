import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageModule } from 'primeng/message';
import { RatingModule } from 'primeng/rating';
import { Tag } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../services/common.service';
import { MessageService } from 'primeng/api';
import { OVERVIEW_FORM_MODEL } from '../../../../modules/barber-dashboard.interfaces';
import { StarRatingDisplayComponent } from '../../../../shared/star-rating-display/star-rating-display.component';

@Component({
  selector: 'app-overview-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TextareaModule,
    MessageModule,
    TooltipModule,
    DialogModule,
    ButtonModule,
    Message,
    RatingModule,
    Tag,
    InputTextModule,
    AvatarModule,
    StarRatingDisplayComponent
  ],
  templateUrl: './overview-appointment.component.html',
  styleUrl: './overview-appointment.component.scss'
})
export class OverviewAppointmentComponent {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);

  visibleOverviewDialog = model<boolean>(false); 

  overviewForm!: FormGroup<OVERVIEW_FORM_MODEL>

  constructor(){
    this.overviewForm = this.fb.group<OVERVIEW_FORM_MODEL>({
      appointment_id: this.fb.control(null),
      barber_name: this.fb.control(null),
      customer_name: this.fb.control(null),
      appointment_barber_rating: this.fb.control(null),
      appointment_customer_rating: this.fb.control(null),
      barber_rating_avg: this.fb.control(null),
      client_rating_avg: this.fb.control(null),
      barber_rating_count: this.fb.control(null),
      client_rating_count: this.fb.control(null),
      service_name: this.fb.control(null),
      appointment_status: this.fb.control(null),
      appointment_overview: this.fb.control(null),
      cancel_reason: this.fb.control(null), 
      admin_cancel_reason: this.fb.control(null),
      customer_cancel_reason: this.fb.control(null),
      start_time: this.fb.control(null),
      customer_avatar_url: this.fb.control(null),
      barber_avatar_url: this.fb.control(null)

    })


  }

  loadAppointmentDetails(appId: number):void{
    this.overviewForm.reset();
    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {

        console.log("==|| complete dialog ||== apointment details ==", response)

        this.overviewForm.patchValue({
          appointment_id: response?.appointment_id,
          barber_name: response?.barber_name,
          customer_name: response?.customer_name,
          appointment_barber_rating: response?.appointment_barber_rating,
          appointment_customer_rating: response?.appointment_customer_rating,
          barber_rating_avg: response?.barber_rating_avg,
          client_rating_avg: response?.client_rating_avg,
          barber_rating_count: response?.barber_rating_count,
          client_rating_count: response?.client_rating_count,
          service_name: response?.service_name,
          appointment_status: response?.appointment_status,
          appointment_overview: response?.appointment_overview,
          cancel_reason: response?.admin_cancel_reason || response?.customer_cancel_reason,
          admin_cancel_reason: response?.admin_cancel_reason,
          customer_cancel_reason: response?.customer_cancel_reason,
          start_time: response?.start_time,
          customer_avatar_url: response?.customer_avatar_url,
          barber_avatar_url: response?.barber_avatar_url

        })

        console.log("this.stars", this.stars)
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
        this.visibleOverviewDialog.set(false);
      }
    });
    
  }

  get stars() {
    return Array.from({ length: 5 }, (_, index) => {

      const starIndex = index + 1;

      console.log("==|| starIndex ||==", starIndex);

      if (this.fsrv.barber_rating_avg && this.fsrv.barber_rating_avg >= starIndex) {
        console.log("full")
        return 'full';
      }

      if (this.fsrv.barber_rating_avg && this.fsrv.barber_rating_avg >= starIndex - 0.5) {
        console.log("half")
        return 'half';
      }
      return 'empty';
    });
  }

  // praguri configurabile — ajustează-le după cum vrei
  private readonly halfStarLowThreshold = 0.3;   // sub asta -> stea goală
  private readonly halfStarHighThreshold = 0.7;  // peste asta -> stea plină

  getStarClass(rating: number | null | undefined, position: number): string {
    const value = this.roundForDisplay(rating ?? 0);
    if (value >= position) {
      return 'fa-solid fa-star';
    }
    if (value >= position - 0.5) {
      return 'fa-solid fa-star-half-stroke';
    }
    return 'fa-regular fa-star';
  }

  private roundForDisplay(value: number): number {
    const floorValue = Math.floor(value);
    const fraction = value - floorValue;

    if (fraction < this.halfStarLowThreshold) {
      return floorValue;          // ex: 4.2 -> 4 (stea goală pt a 5-a)
    }
    if (fraction <= this.halfStarHighThreshold) {
      return floorValue + 0.5;    // ex: 4.5 -> 4.5 (jumătate)
    }
    return floorValue + 1;        // ex: 4.8 -> 5 (stea plină)
  }
  get fsrv(){
    return this.overviewForm.value;
  }
  get fsrc(){
    return this.overviewForm.controls;
  }


  

}
