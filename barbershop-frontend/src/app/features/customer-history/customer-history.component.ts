import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

import { Toast } from 'primeng/toast';

import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Select } from 'primeng/select';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ClientDashboardService } from '../../services/client-dashboard.service';
import { ComboBoxService } from '../../services/combo-box.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { parseStringToDate } from '../../helpers/date-parser.helper';
import { CommonService } from '../../services/common.service';
import { CUSTOMER_APPOINTMENTS_LIST_ITEM, FILTER_FORM_MODEL, SET_FORM_MODEL, SET_FORM_RATING_MODEL } from '../../modules/client-dashboard.interfaces';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { RatingModule } from 'primeng/rating';
import { IsPastPipe } from '../../pipes/is-past.pipe';
import { CancelDialogComponent } from './components/cancel-dialog/cancel-dialog.component';
import { RatingDialogComponent } from './components/rating-dialog/rating-dialog.component';
import { OverviewAppointmentComponent } from './components/overview-appointment/overview-appointment.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RemovableSortTracker } from '../../helpers/removable-sort.helper';
import { RippleModule } from 'primeng/ripple';


@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    IsPastPipe,
    ReactiveFormsModule,
    Tag, 
    Card, 
    Button, 
    RouterLink, 
    TooltipModule, 
    Toast, 
    Dialog,
    ConfirmDialog,
    Select,
    FormsModule,
    DatePickerModule,
    InputNumberModule,
    TextareaModule,
    Message,
    RatingModule,
    CancelDialogComponent,
    RatingDialogComponent,
    OverviewAppointmentComponent,
    IconFieldModule, 
    InputIconModule,
    InputTextModule,
    RippleModule
  ],
  templateUrl: './customer-history.component.html',
  styleUrl: './customer-history.component.scss'
})


export class CustomerHistoryComponent implements OnInit{
  private sortTracker = new RemovableSortTracker();

  comboBoxService = inject(ComboBoxService);
  clientDashboardService = inject(ClientDashboardService);
  commonService = inject(CommonService)

  // private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild('cancelDialog') cancelDialog!: CancelDialogComponent;
  @ViewChild('ratingDialog') ratingDialog!: RatingDialogComponent;
  @ViewChild('overviewDialog') overviewDialog!: OverviewAppointmentComponent;
  @ViewChild('dt') dt!: Table



  errorMessage = signal<string | null>(null);

  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  minEndDate: Date | null = null;
  maxStartDate: Date | null = null;
  maxAllowedDate: Date = new Date(); // ziua de azi

  displayFilterDialog = signal<boolean>(false);
  appliedfilters: any = null;
  filtersAreApplied = signal<boolean>(false);


  filterForm!: FormGroup<FILTER_FORM_MODEL>;
  //setForm!: FormGroup<SET_FORM_MODEL>
  //setFormRating!: FormGroup<SET_FORM_RATING_MODEL>

  displayDialog: boolean = false;
  displayDialogRating: boolean = false;
  displayOverviewDialog: boolean = false;
  //readOnly: boolean = false;

  private lastSortField: string | null = null;
  private lastSortOrder: number = 0; // 0 = nesortat, 1 = asc, -1 = desc



 constructor(private fb: FormBuilder){
    this.filterForm = this.fb.group<FILTER_FORM_MODEL>({
      service_id: this.fb.control(null),
      barber_id: this.fb.control(null),
      start_date: this.fb.control(null),
      end_date: this.fb.control(null),
      max_price: this.fb.control(null),
      max_duration: this.fb.control(null),
      search_query: this.fb.control(null)
    })

    this.filterForm.valueChanges.subscribe(values => {
      this.minEndDate = parseStringToDate(values.start_date);
      this.maxStartDate = parseStringToDate(values.end_date) || this.maxAllowedDate;
    });
  
 }


  ngOnInit(): void {
    // Încărcăm automat istoricul la inițializarea paginii
    // this.barberService.getCustomerHistory().subscribe();
    this.comboBoxService.loadBarbersCombo();
    this.comboBoxService.loadServicesCombo();

    this.filterForm.get('search_query')?.valueChanges.pipe(
      debounceTime(400),          // Așteaptă 400ms după ce utilizatorul s-a oprit din tastat
      distinctUntilChanged()      // Trite cererea doar dacă textul s-a schimbat efectiv
    ).subscribe(() => {
      if (this.dt) {              
        this.dt.reset();          // Resetează tabelul la pagina 1, declanșând automat loadAppointmentsLazy
      }
    });

  }  


  loadCustomerAppointmentsLazy(event: TableLazyLoadEvent): void {
    this.loading.set(true);

    // Păstrăm valorile direct din evenimentul PrimeNG 
    const first = event.first ?? 0;
    const rows = event.rows ?? 5;

    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dt);    

    const {service_id, barber_id,  start_date, end_date, max_price, max_duration, search_query} = this.fv;
    // const filterPayload = this.filterForm.getRawValue();
    // console.log("filterPayload", filterPayload)
    // Apelăm serviciul actualizat cu noile denumiri de parametri (first, rows), serviceParam, maxPriceParam, maxDurationParam, barberParam
    this.clientDashboardService.loadCustomerAppointments(
      first, 
      rows, 
      service_id, 
      max_price, 
      max_duration, 
      barber_id, 
      start_date, 
      end_date,
      search_query,
      sortField, 
      sortOrder
    ).subscribe({
      next: (response) => {
        console.log("== || loadCustomerAppointmentsLazy || == response == ", response);
        this.clientDashboardService.customerAppointments.set(response.data);
        this.totalRecords.set(response.total);
        
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Eroare onLazyLoad din customer dashboard:', err);
        this.errorMessage.set('Nu s-au putut încărca programările.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(table: Table): void {
    this.appliedfilters = {...this.fv}; 
    this.displayFilterDialog.set(false);
    const hasActiveFilters = Object.values(this.filterForm.value).some(val => val !== null && val !== '');
    this.filtersAreApplied.set(hasActiveFilters);

    table.reset()
  }

  clearFilters(table: Table): void {
    this.filterForm.reset({},{ emitEvent: false });
    this.filtersAreApplied.set(false);
    this.appliedfilters = null;
    
    table.reset();
  }



  downloadPdfReport(): void {
    this.loading.set(true); 

    const {service_id, barber_id,  start_date, end_date, max_price, max_duration, search_query} = this.fv;
    this.clientDashboardService.exportCustomerAppointmentsPdf(
      service_id, 
      max_price, 
      max_duration, 
      barber_id, 
      start_date, 
      end_date,
      search_query
    )
    // statusParam, dateParam
      .subscribe({
        next: (blob: Blob) => {
          // Creăm un URL temporar în browser pentru fișierul binar primit
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Creăm un element invizibil de tip ancoră (link) pentru a simți click-ul de descărcare
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = `raport-programari-${new Date().toISOString().split('T')[0]}.pdf`;
          
          // Forțăm descărcarea și curățăm memoria
          anchor.click();
          window.URL.revokeObjectURL(blobUrl);
          
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Eroare la descărcarea PDF-ului:', err);
          this.loading.set(false);
        }
    });
  }

  

    // Funcție nouă pentru anularea programării
  onCancelAppointmentConfirmation(app: CUSTOMER_APPOINTMENTS_LIST_ITEM): void {
    this.confirmationService.confirm({
      message: 'Sigur dorești să anulezi această programare?',
      header: 'Confirmare Anulare',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Nu',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Da',
        severity: 'secondary'
      },
      accept: () => {
        this.openCancelAppointmentDialog(app)
      }
    });
  }

  openCancelAppointmentDialog(app: CUSTOMER_APPOINTMENTS_LIST_ITEM){
    console.log(" ==|| openSetAppointmentCompletedDialog ||== app ==", app)

    this.cancelDialog.loadAppointmentDetails(app.appointment_id)
    
    this.loading.set(true);
    this.displayDialog = true; 

    // setTimeout(() => this.cancelDialog.loadAppointmentDetails(app.appointment_id));
  }

  showAppointmentInfo(app: CUSTOMER_APPOINTMENTS_LIST_ITEM){
    this.overviewDialog.loadAppointmentDetails(app.appointment_id)
    this.displayOverviewDialog = true;
    // setTimeout(() => this.overviewDialog.loadAppointmentDetails(app.appointment_id));
  }
  
  
  openAppointmentRatingDialog(app: CUSTOMER_APPOINTMENTS_LIST_ITEM){
    console.log("==|| openAppointmentRatingDialog ||== app.status == ", app.status)
    this.ratingDialog.loadAppointmentDetails(app.appointment_id);
    this.loading.set(true);
    this.displayDialogRating = true;
    // setTimeout(() => this.ratingDialog.loadAppointmentDetails(app.appointment_id));
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | undefined {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'info';//success
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'success';//info
      default: return undefined;
    }
  }

  getBackground(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'var(--p-button-info-background)';
      case 'pending': return 'var(--p-button-warn-background)';     
      case 'cancelled': return 'var(--p-button-danger-background)'; 
      case 'completed': return 'var(--p-button-success-background)';
      default: return 'transparent';
    }
  }


  get fv() {
    return this.filterForm.value;
  }

  get fc() {
    return this.filterForm.controls;
  }


}
