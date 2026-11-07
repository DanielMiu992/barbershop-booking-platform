import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Avatar } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { AdminBarbersService } from '../../services/admin-barbers.service';
import { BARBERS_LIST_ITEM, FILTER_FORM_MODEL, SET_FORM_MODEL } from '../../modules/admin-barbers.interfaces';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { AddBarberDialogComponent } from './components/add-barber-dialog/add-barber-dialog.component';
import { SetScheduleDialogComponent } from './components/set-schedule-dialog/set-schedule-dialog.component';
import { RatingModule } from 'primeng/rating';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { StarRatingDisplayComponent } from '../../shared/star-rating-display/star-rating-display.component';
import { RemovableSortTracker } from '../../helpers/removable-sort.helper';



@Component({
  selector: 'app-admin-barbers',
  standalone: true,
  imports: [CommonModule, 
            FormsModule, 
            ReactiveFormsModule,
            TableModule, 
            Button, 
            Message,
            Card, 
            Tag, 
            Dialog, 
            ConfirmDialog,
            InputText, 
            Avatar, 
            Toast, 
            TooltipModule,
            SelectModule,
            RatingModule,
            AddBarberDialogComponent,
            SetScheduleDialogComponent,
            IconFieldModule, 
            InputIconModule,
            StarRatingDisplayComponent
          ],
  templateUrl: './admin-barbers.component.html',
  styleUrl: './admin-barbers.component.scss'
})

export class AdminBarbersComponent {

  private sortTracker = new RemovableSortTracker();
  
    
  adminBarbersService = inject(AdminBarbersService);

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Semnale locale pentru a stoca starea paginată
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  @ViewChild('addBarberDialog') addBarberDialog!: AddBarberDialogComponent;
  @ViewChild('setScheduleDialog') setScheduleDialog!: SetScheduleDialogComponent;
  @ViewChild('dt') dt!: Table


  // Opțiunile pentru combo box (dropdown)
  statusOptions = [
    { label: 'Toți frizerii', value: null },
    { label: 'Activi', value: true },
    { label: 'Inactivi', value: false }
  ];
  
  lastLazyLoadEvent!: TableLazyLoadEvent;

  displayDialog: boolean = false;
  isEditMode = signal<boolean>(false);

  displayScheduleDialog: boolean = false;
  selectedBarberForSchedule: any = null;

  displayFilterDialog = signal<boolean>(false);
  filtersAreApplied = signal<boolean>(false);

  appliedfilters: any = null;
  weeklySchedule: any[] = [];

  filterForm!: FormGroup<FILTER_FORM_MODEL>;
  setForm!: FormGroup<SET_FORM_MODEL>
  scheduleForm!: FormGroup;

  // Indexarea zilelor corespunde cu targetDate.getDay() (0 = Duminică, 1 = Luni...)
  daysLabels: string[] = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

  constructor(private fb: FormBuilder){
    
    this.filterForm = this.fb.group<FILTER_FORM_MODEL>({
      barber_name: this.fb.control(null),
      status: this.fb.control(null)
    })

    this.scheduleForm = this.fb.group({
      days: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.filterForm.get('barber_name')?.valueChanges.pipe(
      debounceTime(400),          // Așteaptă 400ms după ce utilizatorul s-a oprit din tastat
      distinctUntilChanged()      // Trite cererea doar dacă textul s-a schimbat efectiv
    ).subscribe(() => {
      if (this.dt) {              
        this.dt.reset();          // Resetează tabelul la pagina 1, declanșând automat loadAppointmentsLazy
      }
    });
    
  }



  openEditDialog(barber?: BARBERS_LIST_ITEM): void {
    this.loading.set(true);
    if(barber) {
      this.isEditMode.set(true)
      this.addBarberDialog.getBarbersDetails(barber.id as number);
    }else{
      this.isEditMode.set(false);
    } 

    this.displayDialog = true;
    
  }


  loadBarbersLazy(event: TableLazyLoadEvent): void {
    // console.log("==|| event || == loadBarbersLazy ==", event);
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 5;

    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dt);

    const {barber_name, status} = this.fv;


    this.adminBarbersService.loadAdminBarbers({
      search: barber_name !== null ? barber_name : undefined,
      active: status !== null ? status?.value : null,      
      first: first,
      rows: rows,
      sortField, 
      sortOrder
    }).subscribe({
      next: (response) => {
        console.log("== || loadAdminBarbers || == response.data ==", response.data)
        this.adminBarbersService.adminBarbers.set([...response.data]); 
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }


  downloadPdfReport(): void {
    this.loading.set(true); 

    const {barber_name, status} = this.fv;

    this.adminBarbersService.exportAdminBarbersPdf(barber_name, status?.value)

      .subscribe({
        next: (blob: Blob) => {
          // Creăm un URL temporar în browser pentru fișierul binar primit
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Creăm un element invizibil de tip ancoră (link) pentru a simți click-ul de descărcare
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = `raport-echipa-frizeri-${new Date().toISOString().split('T')[0]}.pdf`;
          
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
  // applyFilters(table: Table): void {
  //   table.reset();
  // }

  // clearFilters(table: Table): void {
  //   this.filterForm.reset();
  //   table.reset();
  // }

  openScheduleDialog(barber: BARBERS_LIST_ITEM): void {
    console.log("== || openScheduleDialog || == barber ==", barber);

    this.loading.set(true);
    this.displayScheduleDialog = true;

    this.selectedBarberForSchedule = barber.first_name + ' ' + barber.last_name;
    this.setScheduleDialog.getBarberSchedule(barber.id as number);

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




  toggleStatus(barber: BARBERS_LIST_ITEM, table: Table): void {
    const updated: BARBERS_LIST_ITEM = { ...barber, is_active: !barber.is_active };
    this.loading.set(true);

    this.confirmationService.confirm({
      message: `Sigur dorești să ${updated.is_active ? 'activezi' : 'dezactivezi'} acest frizer?`,
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
        // Codul se execută DOAR dacă utilizatorul apasă pe butonul roșu de confirmare
        this.adminBarbersService.upsertBarber(updated).subscribe({
          next: (response) => {

           console.log("== || toggle status || == response == ", response)

            this.messageService.add({ 
              severity: 'info', 
              summary: 'Status actualizat', 
              detail: `Frizerul a fost ${updated.is_active ? 'activat' : 'dezactivat'}.`,
              life: 4000 
            });

            this.loadBarbersLazy({
              first: table.first ?? 0,
              rows: table.rows ?? 10
            });
          },
          error: (err) => {
            console.error('Eroare la schimbarea statusului:', err);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Eroare', 
              detail: 'Nu s-a putut actualiza statusul frizerului.' 
            });
            this.loading.set(false);
          }
          
        });
      },
      reject: () => {
        this.loading.set(false);
      }
    });
    
  }

  getBackground(is_active: boolean): string {
    return is_active ? 'var(--p-button-success-background)' : 'var(--p-button-danger-background)';
  }

  getColor(is_active : boolean): string {
    return is_active ? 'var(--p-tag-success-background)' : 'var(--p-tag-danger-background)';
  }

  get fv() {
    return this.filterForm.value;
  }

  get fc() {
    return this.filterForm.controls;
  }

    // Scurtătură (Getter) puternic tipizată pentru FormArray
  get daysFormArray() {
    return this.scheduleForm.get('days') as FormArray<FormGroup>;
  }


}
