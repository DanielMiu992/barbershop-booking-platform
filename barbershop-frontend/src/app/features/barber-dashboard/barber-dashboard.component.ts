import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { Card } from 'primeng/card';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { IsPastPipe } from '../../pipes/is-past.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { Message } from 'primeng/message';
import { RatingModule } from 'primeng/rating';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ComboBoxService } from '../../services/combo-box.service';
import { BarberDashboardService } from '../../services/barber-dashboard.service';
import { CommonService } from '../../services/common.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BARBER_APPOINTMENTS_LIST_ITEM, FILTER_FORM_MODEL } from '../../modules/barber-dashboard.interfaces';
import { parseStringToDate } from '../../helpers/date-parser.helper';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CancelDialogComponent } from './components/cancel-dialog/cancel-dialog.component';
import { OverviewAppointmentComponent } from './components/overview-appointment/overview-appointment.component';
import { RatingDialogComponent } from './components/rating-dialog/rating-dialog.component';
import { isAppointmentInFuture } from '../../helpers/check-date-status-completed.helper';
import { CompleteDialogComponent } from './components/complete-dialog/complete-dialog.component';
import { IsFuturePipe } from '../../pipes/is-future.pipe';
import { RemovableSortTracker } from '../../helpers/removable-sort.helper';
import { Avatar } from 'primeng/avatar';


@Component({
  selector: 'app-barber-dashboard',
  imports: [
    CommonModule, 
    TableModule, 
    IsPastPipe,
    IsFuturePipe,
    ReactiveFormsModule,
    Tag, 
    Card, 
    Avatar,
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
    CompleteDialogComponent,
    IconFieldModule, 
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './barber-dashboard.component.html',
  styleUrl: './barber-dashboard.component.scss'
})
export class BarberDashboardComponent {
  private sortTracker = new RemovableSortTracker();
  
  comboBoxService = inject(ComboBoxService);
  barberDashboardService = inject(BarberDashboardService);
  commonService = inject(CommonService);

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  
  selectedAppointment: BARBER_APPOINTMENTS_LIST_ITEM | null = null;
  
  @ViewChild('completeDialog') completeDialog!: CompleteDialogComponent;
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

  displayDialog: boolean = false;
  displayDialogRating: boolean = false;
  displayOverviewDialog: boolean = false;
  displayDialogCanceledAppointment: boolean = false;


 constructor(private fb: FormBuilder){
  this.filterForm = this.fb.group<FILTER_FORM_MODEL>({
    service_id: this.fb.control(null),
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

  loadBarberAppointmentsLazy(event: TableLazyLoadEvent): void {
    this.loading.set(true);

    // Păstrăm valorile direct din evenimentul PrimeNG 
    const first = event.first ?? 0;
    const rows = event.rows ?? 5;

    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dt);


    const {service_id, start_date, end_date, max_price, max_duration, search_query} = this.fv;

    this.barberDashboardService.loadBarberAppointments(
      first, 
      rows, 
      service_id, 
      max_price, 
      max_duration, 
      start_date, 
      end_date,
      search_query,
      sortField, 
      sortOrder
    ).subscribe({
      next: (response) => { 
        console.log("== || loadCustomerAppointmentsLazy || == response == ", response);
        this.barberDashboardService.barberAppointments.set(response.data);
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

  downloadPdfReport(): void {
    this.loading.set(true); 

    const {service_id, start_date, end_date, max_price, max_duration, search_query} = this.fv;
    this.barberDashboardService.exportBarberAppointmentsPdf(
      service_id, 
      max_price, 
      max_duration, 
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

  onSetAppointmentConfirmation(app: BARBER_APPOINTMENTS_LIST_ITEM): void{
    this.loading.set(true); 

    console.log("==|| onSetAppointmentConfirmation ||== isAppointmentInFuture ==", isAppointmentInFuture(app.start_time))

    if (isAppointmentInFuture(app.start_time)) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Acțiune blocată', 
        detail: 'Nu poți finaliza o programare care nu a început încă.' 
      });
      this.loading.set(false); 
      return;
    }

    this.confirmationService.confirm({
      message: 'Sigur dorești să marchezi ca finalizata această programare?',
      header: 'Confirmare status',
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
        this.openSetAppointmentCompletedDialog(app)
      },

      reject: () => {
        this.loading.set(false);
      }
   });


  }

  openSetAppointmentCompletedDialog(app: BARBER_APPOINTMENTS_LIST_ITEM){
    // console.log(" ==|| openSetAppointmentCompletedDialog ||== service == ", app)

    this.loading.set(true);
    this.completeDialog.loadAppointmentDetails(app.appointment_id)
    this.displayDialog = true;

    this.selectedAppointment = app;

  }

  

    // Funcție nouă pentru anularea programării
  onCancelAppointmentConfirmation(app: BARBER_APPOINTMENTS_LIST_ITEM): void {
    this.loading.set(true);
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
      },
      reject: () => {
        this.loading.set(false);
      }

    });
  }

  openCancelAppointmentDialog(app: BARBER_APPOINTMENTS_LIST_ITEM){
    console.log(" ==|| openSetAppointmentCompletedDialog ||== app ==", app)

    this.cancelDialog.loadAppointmentDetails(app.appointment_id)
    
    this.loading.set(true);
    this.displayDialogCanceledAppointment = true; 

  }

  showAppointmentInfo(app: BARBER_APPOINTMENTS_LIST_ITEM){
    this.overviewDialog.loadAppointmentDetails(app.appointment_id)
    this.displayOverviewDialog = true;
  }
  
  
  openAppointmentRatingDialog(app: BARBER_APPOINTMENTS_LIST_ITEM){
    this.ratingDialog.loadRatingDetails(app.appointment_id)
    this.selectedAppointment = app;
    this.displayDialogRating = true;
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
