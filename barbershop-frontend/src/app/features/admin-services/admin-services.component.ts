import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { AdminServicesService } from '../../services/admin-services.service';
import { FILTER_FORM_MODEL, FILTER_FORM_SPECIALTIES_MODEL, SERVICES_LIST_ITEM, SET_FORM_MODEL, SPECIALTIES_LIST_ITEM } from '../../modules/admin-services.interface';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { AddServiceDialogComponent } from './components/add-service-dialog/add-service-dialog.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RemovableSortTracker } from '../../helpers/removable-sort.helper';
import { TabsModule } from 'primeng/tabs';
import { AddSpecialtyDialogComponent } from './components/add-specialty-dialog/add-specialty-dialog.component';

@Component({
  selector: 'app-admin-services',
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
            Toast, 
            Button, 
            TooltipModule, 
            SelectModule,
            AddServiceDialogComponent,
            AddSpecialtyDialogComponent,
            IconFieldModule, 
            InputIconModule,
            TabsModule
            
          ],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.scss'
})
export class AdminServicesComponent {

  private sortTracker = new RemovableSortTracker();
  
  adminServicesService = inject(AdminServicesService);

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  errorMessage = signal<string | null>(null);

  displayDialog = false;
  displayDialogSp = false;

  isEditMode = signal<boolean>(false);
  isEditModeSp =  signal<boolean>(false);

  displayFilterDialog = signal<boolean>(false);
  filtersAreApplied = signal<boolean>(false);

  appliedfilters: any = null;


  totalRecordSv = signal<number>(0);
  totalRecordSp = signal<number>(0);
  loading = signal<boolean>(false);

  @ViewChild('addServiceDialog') addServiceDialog!: AddServiceDialogComponent;
  @ViewChild('dtsv') dtsv!: Table;
  @ViewChild('dtsp') dtsp!: Table;

  statusOptions = [
    { label: 'Toate', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  filterForm!: FormGroup<FILTER_FORM_MODEL>;
  filterFormSp!: FormGroup<FILTER_FORM_SPECIALTIES_MODEL>;

  private lastSortField: string | null = null;
  private lastSortOrder: number = 0; // 0 = nesortat, 1 = asc, -1 = desc


  constructor(private fb: FormBuilder){
    this.filterForm = this.fb.group<FILTER_FORM_MODEL>({
      service_name: this.fb.control(null),
      status: this.fb.control(null),
      max_price: this.fb.control(null)
    })

    this.filterFormSp = this.fb.group<FILTER_FORM_SPECIALTIES_MODEL>({
      search_query: this.fb.control(null),
      status: this.fb.control(null),
    })



  }

  ngOnInit(): void {
    this.filterForm.get('service_name')?.valueChanges.pipe(
      debounceTime(400),          // Așteaptă 400ms după ce utilizatorul s-a oprit din tastat
      distinctUntilChanged()      // Trite cererea doar dacă textul s-a schimbat efectiv
    ).subscribe(() => {
      if (this.dtsv) {              
        this.dtsv.reset();          // Resetează tabelul la pagina 1, declanșând automat loadAppointmentsLazy
      }
    });

    this.filterFormSp.get('search_query')?.valueChanges.pipe(
      debounceTime(400),          
      distinctUntilChanged()      
    ).subscribe(() => {
      if (this.dtsp) {              
        this.dtsp.reset();         
      }
    });
    
  }

  loadServicesLazy(event: TableLazyLoadEvent): void {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 5;
    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dtsv);
    const {service_name, status, max_price} = this.fv;


    this.adminServicesService.loadAdminServices(first, rows, service_name, status?.value, max_price, sortField, sortOrder).subscribe({
      next: (response) => {

        console.log("== || loadAdminServices || == response.data ==", response.data)
        this.adminServicesService.adminSv.set(response.data); 

        this.totalRecordSv.set(response.total);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare onlazyLoad a serviciilor:', err);
        this.errorMessage.set('Nu s-a putut încărca lista de servicii.');
        this.loading.set(false);
      }
    });
  }


  downloadPdfReport(): void {
    this.loading.set(true); 

    const {service_name, status, max_price} = this.fv;

    this.adminServicesService.exportAdminServicesPdf(service_name, status?.value, max_price)
    // statusParam, dateParam
      .subscribe({
        next: (blob: Blob) => {
          // Creăm un URL temporar în browser pentru fișierul binar primit
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Creăm un element invizibil de tip ancoră (link) pentru a simți click-ul de descărcare
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = `raport-catalog-servicii-${new Date().toISOString().split('T')[0]}.pdf`;
          
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

  openEditDialog(service?: SERVICES_LIST_ITEM): void {
    this.loading.set(true);
    if(service) {
      this.isEditMode.set(true);
      this.addServiceDialog.getServiceDetails(service.id as number);
    }else{
      this.isEditMode.set(false);
    } 

    this.displayDialog = true;
    
  }

  openEditSpDialog(sp?: SPECIALTIES_LIST_ITEM){
    if(sp){
      this.isEditModeSp.set(true);
    }else{
      this.isEditModeSp.set(false);
    }
    this.displayDialogSp = true;
  }
  
  applyFilters(table: Table): void {
    console.log("==|| this.fv || == applyFilters ==", this.fv)
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



  toggleStatus(service: SERVICES_LIST_ITEM, table: Table): void {

    const updated: SERVICES_LIST_ITEM = { ...service, is_active: !service.is_active };
    this.loading.set(true);

    this.confirmationService.confirm({
      message: `Sigur dorești să ${updated.is_active ? 'activezi' : 'dezactivezi'} acest serviciu?`,
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
        this.adminServicesService.upsertService(updated).subscribe({
          next: (response) => {

           console.log("== || toggle status || == response == ", response)

            this.messageService.add({ 
              severity: 'info', 
              summary: 'Status actualizat', 
              detail: `Serviciul a fost ${updated.is_active ? 'activat' : 'dezactivat'}.`,
              life: 4000 
            });

            this.loadServicesLazy({
              first: table.first ?? 0,
              rows: table.rows ?? 10
            });
          },
          error: (err) => {
            console.error('Eroare la schimbarea statusului:', err);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Eroare', 
              detail: 'Nu s-a putut actualiza statusul serviciului.' 
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


  get fv() {
    return this.filterForm.value;
  }

  get fc() {
    return this.filterForm.controls;
  }


  ////////////////////////////////////////////


  loadSpecialtiesLazy(event: TableLazyLoadEvent): void {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 5;
    const { sortField, sortOrder } = this.sortTracker.resolve(event, this.dtsv);
    const {search_query, status} = this.fsv;


    this.adminServicesService.loadAdminSpecialties(first, rows, search_query, status?.value, sortField, sortOrder).subscribe({
      next: (response) => {

        console.log("== || loadAdminSpecialties || == response.data ==", response.data)
        
        this.adminServicesService.adminSp.set(response.data); 
        this.totalRecordSp.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare onlazyLoad:', err);
        this.errorMessage.set('Nu s-a putut încărca lista.');
        this.loading.set(false);
      }
    });
  }


  get fsv() {
    return this.filterFormSp.value;
  }

  get fsc() {
    return this.filterFormSp.controls;
  }


  


}
