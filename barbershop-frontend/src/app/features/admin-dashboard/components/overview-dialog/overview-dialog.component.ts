import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Message, MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../services/common.service';
import { OVERVIEW_FORM_MODEL } from '../../../../modules/admin-dashboard.interfaces';
import { RatingModule } from 'primeng/rating';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { StarRatingDisplayComponent } from '../../../../shared/star-rating-display/star-rating-display.component';

@Component({
  selector: 'app-overview-dialog',
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
  templateUrl: './overview-dialog.component.html',
  styleUrl: './overview-dialog.component.scss'
})

export class OverviewDialogComponent {
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

  get fsrv(){
    return this.overviewForm.value;
  }
  get fsrc(){
    return this.overviewForm.controls;
  }

}
