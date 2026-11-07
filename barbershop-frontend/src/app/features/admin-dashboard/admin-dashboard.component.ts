import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { Card, CardModule } from 'primeng/card';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuthService } from '../../core/auth/auth.service';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { ComboBoxService } from '../../services/combo-box.service';
import { ADMIN_APPOINTMENTS_ITEM_LIST, FILTER_FORM_MODEL, SET_FORM_MODEL, SET_FORM_MODEL_CANCELLED_APP, SET_FORM_RATING_MODEL } from '../../modules/admin-dashboard.interfaces';
import { parseStringToDate } from '../../helpers/date-parser.helper';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { Message } from 'primeng/message';
import { isAppointmentInFuture } from '../../helpers/check-date-status-completed.helper';
import { IsFuturePipe } from '../../pipes/is-future.pipe';
import { IsPastPipe } from '../../pipes/is-past.pipe';
import { isAppointmentInPast } from '../../helpers/check-date-status-cancelled.helper';
import { RatingModule } from 'primeng/rating';
import { RatingDialogComponent } from './components/rating-dialog/rating-dialog.component';
import { CompleteDialogComponent } from './components/complete-dialog/complete-dialog.component';
import { CancelDialogComponent } from './components/cancel-dialog/cancel-dialog.component';
import { OverviewDialogComponent } from './components/overview-dialog/overview-dialog.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RemovableSortTracker } from '../../helpers/removable-sort.helper';
import { Avatar } from 'primeng/avatar';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    IsFuturePipe,
    IsPastPipe,
    Tag, 
    Card, 
    FormsModule, 
    ReactiveFormsModule,
    Button, 
    Select, 
    TooltipModule, 
    Toast, 
    Dialog,
    ConfirmDialog,
    InputTextModule, 
    DatePickerModule,
    TextareaModule,
    Message,
    RatingModule,
    RatingDialogComponent,
    CompleteDialogComponent,
    CancelDialogComponent,
    OverviewDialogComponent,
    CardModule,
    IconFieldModule, 
    InputIconModule,
    Avatar
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit{

  private sortTracker = new RemovableSortTracker();
  
  authService = inject(AuthService);
  comboBoxService = inject(ComboBoxService);
  adminDashboardService = inject (AdminDashboardService);

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  
  
  selectedAppointment: ADMIN_APPOINTMENTS_ITEM_LIST | null = null;

  statusOptions = [
    { label: 'Confirmată', value: 'confirmed' },
    { label: 'Finalizată', value: 'completed' },
    { label: 'Anulată', value: 'cancelled' },
  ];

  @ViewChild('ratingDialog') ratingDialog!: RatingDialogComponent;
  @ViewChild('completeDialog') completeDialog!: CompleteDialogComponent;
  @ViewChild('cancelDialog') cancelDialog!: CompleteDialogComponent;
  @ViewChild('overviewDialog') overviewDialog!: OverviewDialogComponent;
  @ViewChild('dt') dt!: Table

  errorMessage = signal<string | null>(null);

  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  minEndDate: Date | null = null;
  maxStartDate: Date | null = null;
  maxAllowedDate: Date = new Date(); // ziua de azi

  displayFilterDialog = signal<boolean>(false);

  displayDialog: boolean = false;
  displayDialogCanceledAppointment: boolean = false;
  displayDialogRating: boolean = false;
  displayOverviewDialog: boolean = false;

  readOnly: boolean = false;
  appliedfilters: any = null;
  filtersAreApplied = signal<boolean>(false);

  value = signal<string | null>(null);

  filterForm!: FormGroup<FILTER_FORM_MODEL>;


  currentSortField = signal<string | undefined>(undefined);
  currentSortOrder = signal<number | undefined>(undefined);

  constructor(private fb: FormBuilder){

    this.filterForm = this.fb.group<FILTER_FORM_MODEL>({
      customer_name: this.fb.control(null),
      barber_id: this.fb.control(null),
      service_id: this.fb.control(null),
      start_date: this.fb.control(null),
      end_date: this.fb.control(null),
      search_query: this.fb.control(null),
      status: this.fb.control(null)
    })

    this.filterForm.valueChanges.subscribe(values => {
      this.minEndDate = parseStringToDate(values.start_date);
      this.maxStartDate = parseStringToDate(values.end_date) || this.maxAllowedDate;
    });
    

  }

  ngOnInit(): void {
    // Încarcă toate programările în momentul în care adminul deschide pagina
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

  loadAppointmentsLazy(event: TableLazyLoadEvent): void {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 5;

    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dt);

    this.currentSortField.set(sortField);
    this.currentSortOrder.set(sortOrder);

    console.log("this.currentSortField", this.currentSortField())
    console.log("this.currentSortOrder", this.currentSortOrder())

    console.log("==|| loadAppointmentsLazy || == this.fv ==", this.fv)
    const {customer_name, barber_id, service_id, start_date, end_date, search_query, status} = this.fv;

    this.adminDashboardService.loadAdminAppointments(first, rows, customer_name, barber_id?.id, service_id?.id, start_date, end_date, search_query, status?.value, sortField, sortOrder).subscribe({
      next: (response) => {
        this.adminDashboardService.adminAppointments.set(response.data);
        console.log("response.data", response.data)
        this.totalRecords.set(response.total);        
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Eroare onLazyLoad din dashboard:', err);
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

    table.reset();
  }



  clearFilters(table: Table): void {
    this.filterForm.reset({},{ emitEvent: false });
    this.filtersAreApplied.set(false);
    this.appliedfilters = null;
    table.reset();
  }

  downloadPdfReport(): void {
    this.loading.set(true); 

    const {customer_name, barber_id, service_id, start_date, end_date, search_query} = this.fv;

    // const { sortField, sortOrder } = this.sortTracker.resolve(event,this.dt);

    this.adminDashboardService.exportAdminAppointmentsPdf(customer_name, barber_id?.id, service_id?.id, start_date, end_date, search_query, this.currentSortField(), this.currentSortOrder())
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

  onSetAppointmentConfirmation(app: ADMIN_APPOINTMENTS_ITEM_LIST): void{
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
      // icon: 'fa-solid fa-triangle-exclamation',
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

  openSetAppointmentCompletedDialog(app: ADMIN_APPOINTMENTS_ITEM_LIST){
    // console.log(" ==|| openSetAppointmentCompletedDialog ||== service == ", app)

    this.loading.set(true);
    this.completeDialog.loadAppointmentDetails(app.id)
    this.displayDialog = true;

    this.selectedAppointment = app;

  }


  showAppointmentInfo(app: ADMIN_APPOINTMENTS_ITEM_LIST){
    this.overviewDialog.loadAppointmentDetails(app.id)
    this.displayOverviewDialog = true;
  }



  onCancelAppointmentConfirmation(app: ADMIN_APPOINTMENTS_ITEM_LIST): void {
    this.loading.set(true); 
    console.log("==|| onCancelAppointmentConfirmation ||== isAppointmentInPast ==", isAppointmentInPast(app.start_time))
    if (isAppointmentInPast(app.start_time)) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Acțiune blocată', 
        detail: 'Nu poți anula o programare din trecut.' 
      });
      this.loading.set(false); 
      return;
    }


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
  
  openCancelAppointmentDialog(app: ADMIN_APPOINTMENTS_ITEM_LIST){
    // console.log(" ==|| openSetAppointmentCompletedDialog ||== app == ", app)

    this.loading.set(true);
    this.cancelDialog.loadAppointmentDetails(app.id)
    this.displayDialogCanceledAppointment = true;
    this.selectedAppointment = app;    

  }

  openAppointmentRatingDialog(app: ADMIN_APPOINTMENTS_ITEM_LIST){
    this.ratingDialog.loadRatingDetails(app.id)
    this.selectedAppointment = app;
    this.displayDialogRating = true;
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | undefined {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'info';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'completed': return 'success';
      default: return undefined;
    }
  }

  // getBackground(status: string): string {
  //   switch (status.toLowerCase()) {
  //     case 'confirmed': return 'var(--p-tag-info-color)';
  //     case 'pending': return 'var(--p-tag-warn-color)';     
  //     case 'cancelled': return 'var(--p-tag-danger-color)'; 
  //     case 'completed': return 'var(--p-tag-success-color)';
  //     default: return 'transparent';
  //   }
  // }

  getBackground(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'var(--p-button-info-background)';
      case 'pending': return 'var(--p-button-warn-background)';     
      case 'cancelled': return 'var(--p-button-danger-background)'; 
      case 'completed': return 'var(--p-button-success-background)';
      default: return 'transparent';
    }
  }


  getColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'var(--p-tag-info-background)';
      case 'pending': return 'var(--p-tag-warn-background)';     
      case 'cancelled': return 'var(--p-tag-danger-background)'; 
      case 'completed': return 'var(--p-tag-success-background)';
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
