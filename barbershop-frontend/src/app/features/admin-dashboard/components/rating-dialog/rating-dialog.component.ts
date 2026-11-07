import { Component, EventEmitter, inject, input, Input, model, output, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { AdminDashboardService } from '../../../../services/admin-dashboard.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { RatingModule } from 'primeng/rating';
import { TooltipModule } from 'primeng/tooltip';
import { ADMIN_APPOINTMENTS_ITEM_LIST, SET_FORM_RATING_MODEL } from '../../../../modules/admin-dashboard.interfaces';
import { CommonModule } from '@angular/common';
import { StarRatingDisplayComponent } from '../../../../shared/star-rating-display/star-rating-display.component';
import { Avatar } from 'primeng/avatar';

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
    StarRatingDisplayComponent,
    Avatar
  ],
  templateUrl: './rating-dialog.component.html',
  styleUrl: './rating-dialog.component.scss'
})
export class RatingDialogComponent {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private adminDashboardService = inject(AdminDashboardService);
  private messageService = inject(MessageService)

  // Model() oferă automat legătură de date bidirecțională (înlocuiește visible și visibleChange)
  visible = model<boolean>(false);
  
  // Input primit de la părinte la click pe buton
  appointment = input<ADMIN_APPOINTMENTS_ITEM_LIST | null>(null);
  
  // Output de tip Signal (înlocuiește EventEmitter) pentru a anunța părintele să reîmprospăteze tabelul
  onSaved = output<void>();

  setFormRating!: FormGroup<SET_FORM_RATING_MODEL>;

  readOnly = signal<boolean>(false);
  isSavingRating = signal<boolean>(false);

  constructor(){
    this.setFormRating = this.fb.group<SET_FORM_RATING_MODEL>({
      rating: this.fb.control(null, [Validators.required]),
      client_rating_count: this.fb.control(null),
      client_rating: this.fb.control(null),
      client_id: this.fb.control(null),
      client_name: this.fb.control(null),
      appointment_id: this.fb.control(null),
      client_avatar_url: this.fb.control(null),
    },{updateOn:'submit'})

  } 


  loadRatingDetails(appId: number) {
    this.setFormRating.reset();
    
    this.commonService.getAppointmentDetails(appId).subscribe({
      next: (response) => {
        // this.readOnly = !!response.appointment_customer_rating;
        this.readOnly.set(!!response.appointment_customer_rating);
        
        this.setFormRating.patchValue({
          client_name: response.customer_name,
          client_id: response.customer_id,
          appointment_id: response.appointment_id,
          client_rating_count: response.client_rating_count,
          client_rating: response.client_rating_avg,
          rating: response.appointment_customer_rating,
          client_avatar_url: response.customer_avatar_url
        });
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
        this.visible.set(false);
      }
    });
  }

  onSetAppointmentRating(): void {
    this.fsrc.rating.markAsTouched();
    if (this.setFormRating.invalid) return;

    this.isSavingRating.set(true);
    const { appointment_id, client_id, rating } = this.fsrv;

    this.adminDashboardService.setClientRate(appointment_id as number, client_id as number, rating as number).subscribe({
      next: (response) => {
        this.messageService.add({ 
          severity: 'info', 
          summary: 'Recenzie adăugată', 
          detail: response.message,
          life: 4000 
        });
        
        this.isSavingRating.set(false);
        this.onSaved.emit();    // Emite semnalul de succes către părinte
        this.visible.set(false); // Închide dialogul folosind semnalul local

      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare la adăugarea recenziei', 
          detail: err.error?.message || 'Nu s-a putut efectua adăugarea recenziei.' 
        });
        this.isSavingRating.set(false);
      }
    });
  }

  // Getters pentru scannability în HTML
  get fsrv() {
    return this.setFormRating.value;
  }
  get fsrc() {
    return this.setFormRating.controls;
  }


}
