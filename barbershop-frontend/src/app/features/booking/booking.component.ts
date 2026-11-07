import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, Signal, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
// import { BarberPerson, BarberPersonCombo, BarberService, BarberServiceItem, BarberServiceItemCombo } from '../../services/barber.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
//import { Toast } from 'primeng/toast'; 
import { ConfirmationService, MessageService } from 'primeng/api';

// Importurile specifice PrimeNG 19 pentru Stepper
import { Step, Stepper, StepList, StepPanel, StepPanels, StepperModule } from 'primeng/stepper'; 
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BookingService } from '../../services/booking.service';
import { BARBERS_COMBO_ITEM, SERVICES_COMBO_ITEM } from '../../modules/combo-box.interfaces';
import { ComboBoxService } from '../../services/combo-box.service';
import { roMobilePhoneValidator, specialCharactersValidator } from '@validators/index';
import { Message } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { toSignal } from '@angular/core/rxjs-interop';
import { Tag } from 'primeng/tag';
import { map } from 'rxjs';
import { StarRatingDisplayComponent } from '../../shared/star-rating-display/star-rating-display.component';
import { Avatar } from 'primeng/avatar';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    Select, 
    DatePicker, 
    Button, 
    Message,
    Card, 
    InputText, 
    RouterLink, 
    StepperModule,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    ConfirmDialog ,
    Toast,
    TooltipModule,
    MultiSelectModule,
    Tag,
    StarRatingDisplayComponent,
    Avatar
  ],
  providers: [ConfirmationService],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {

  comboBoxService = inject(ComboBoxService)
  authService = inject(AuthService);
  bookingService = inject(BookingService);

  private messageService = inject(MessageService);

  bookingForm!: FormGroup;

  selectedDate = signal<Date | null>(null);
  selectedSlot = signal<string | null>(null);
  slotsMessage = signal<string | null>(null);

  loadServicesList = signal<SERVICES_COMBO_ITEM[]>([]);
  loadBarbersList = signal<BARBERS_COMBO_ITEM[]>([]);

  selectedServiceCombo = signal<SERVICES_COMBO_ITEM | null>(null);
  selectedBarberCombo = signal<BARBERS_COMBO_ITEM | null>(null);
  

  availableSlots = signal<string[] | null>([]);

  minDate: Date = new Date(); // ziua de azi



  //readonly stepperRef = viewChild<Stepper>('stepper');
  readonly stepperRef = viewChild.required<Stepper>('stepper'); 



  // Câmpuri noi pentru utilizatorii neautentificați
  guestFirstName = '';
  guestLastName = '';
  guestEmail = '';
  guestPhone = '';

  //Steps var for StepperPanel
  activeIndex = signal<number>(0); 
  steps = [
    { label: 'Alege Serviciul', id: 1 },
    { label: 'Alege Data și Ora', id: 2 },
    { label: 'Completează Detaliile', id: 3 },
  ];

  private router = inject(Router);

  selectedServices!: Signal<any>

  constructor(private fb: FormBuilder) {

    this.bookingForm = this.fb.group({
      step_1: this.fb.group({
        service_id: [null, Validators.required],
      }),
      step_2: this.fb.group({
        addon_service_ids: [null],
      }),
      step_3: this.fb.group({
        barber_id: [null, Validators.required],
      }),
      step_4: this.fb.group({
        selected_date: [null, Validators.required],
        selected_slot: [null, Validators.required],
      }),
      step_5: this.fb.group({
        last_name: [null, [
          Validators.required,
          Validators.maxLength(60),
          specialCharactersValidator()
        ]],
        first_name: [null, [
          Validators.required,
          Validators.maxLength(60),
          specialCharactersValidator()
        ]],
        email: [null, [
          Validators.required, 
          Validators.email,
          Validators.maxLength(60)
        ]],
        phone: [null, [Validators.required, roMobilePhoneValidator()]]
      })

    // this.bookingForm = this.fb.group({
    //   step_1: this.fb.group({
    //     service_id: [null, Validators.required],
    //     addon_service_ids: [null],
    //   }),
    //   step_2: this.fb.group({
    //     barber_id: [null, Validators.required],
    //   }),
    //   step_3: this.fb.group({
    //     selected_date: [null, Validators.required],
    //     selected_slot: [null, Validators.required],
    //   }),
    //   step_4: this.fb.group({
    //     last_name: ['', [
    //       Validators.required,
    //       Validators.maxLength(60),
    //       specialCharactersValidator()
    //     ]],
    //     first_name: ['', [
    //       Validators.required,
    //       Validators.maxLength(60),
    //       specialCharactersValidator()
    //     ]],
    //     email: ['', [
    //       Validators.required, 
    //       Validators.email,
    //       Validators.maxLength(60)
    //     ]],
    //     phone: ['', [Validators.required, roMobilePhoneValidator()]]
    //   })


    
      
    })

    this.bookingForm.get('step_4.slot')?.valueChanges.subscribe(val => {
      this.selectedSlot.set(val);
    });

    this.s1.get('service_id')?.valueChanges.subscribe(() => {
      this.s4.get('selected_slot')?.reset();
      this.availableSlots.set([]);
    });

    this.s2.get('addon_service_ids')?.valueChanges.subscribe(() => {
      this.s4.get('selected_slot')?.reset();
      this.availableSlots.set([]);
    });


    // this.selectedServices = toSignal(
    //   this.s1.get('service_id')!.valueChanges,
    //   { initialValue: this.s1.get('service_id')?.value ?? [] }
    // );

    this.selectedServices = toSignal(
      this.bookingForm.valueChanges.pipe(
        map(formValue => {
          const selectedObjects: any[] = [];
          const mainService = formValue.step_1?.service_id;
          if (mainService) {
            selectedObjects.push(mainService);
          }
          const addons = formValue.step_2?.addon_service_ids;
          if (addons && addons.length > 0) {
            selectedObjects.push(...addons);
          }
          return selectedObjects;
        })    
      ), { initialValue: [] as any[] }
    )

    console.log("==|| this.selectedServices ||== constructor == ", this.selectedServices);



  }

  selectTimeSlot(slot: string) {
    this.bookingForm.get('step_4.selected_slot')?.setValue(slot);
    this.bookingForm.get('step_4.selected_slot')?.markAsTouched();
  }
  

  ngOnInit(): void {

    this.comboBoxService.loadBarbersCombo();
    this.comboBoxService.loadServicesCombo();

  }

  get s1() { return this.bookingForm.get('step_1') as FormGroup; }
  get s2() { return this.bookingForm.get('step_2') as FormGroup; }
  get s3() { return this.bookingForm.get('step_3') as FormGroup; }
  get s4() { return this.bookingForm.get('step_4') as FormGroup; }
  get s5() { return this.bookingForm.get('step_5') as FormGroup; }



  fetchAvailableSlots(): void {
    const date = this.s4.get('selected_date')?.value;
    const barber = this.s3.get('barber_id')?.value
    const serviceIds = this.selectedServices().map((s: any) => s.id)

    if (date && barber && serviceIds) {
      // Formatează data ca YYYY-MM-DD respectând fusul orar local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Resetează slotul orar selectat anterior și încarcă noile sloturi din backend
      this.selectedSlot.set(null);
      this.loadAvailableSlots(formattedDate, barber.id, serviceIds);
    }
  }

  loadAvailableSlots(date: string, barberId: number, serviceIds: Array<number>): void {
    // console.log("==|| this.s3 || == loadAvailableSlots ==", this.s3)
    this.bookingService.loadAvailableSlots(date, barberId, serviceIds)
      .subscribe({
        next: (response) => {
          console.log("== || loadAvailableSlots || == response == ", response);

          this.slotsMessage.set(response.message || null);

          if (response && response.success && response.data.length > 0) {
            this.availableSlots.set(response.data);

          } else {
            this.availableSlots.set(null);
          }

          console.log("== || loadAvailableSlots || == this.availableSlots() ==", this.availableSlots());
        },
        error: (err) => {
          console.error('Eroare rețea:', err);
          this.availableSlots.set(null);
        }
    });
  }



  // Acest semnal va returna true doar dacă stepper-ul există și pasul este >= 2
  readonly showResetButton = computed(() => {
    const stepperInstance = this.stepperRef();
    if (!stepperInstance) return false;
    const pasCurent = stepperInstance.value?.() ?? 1;
    return pasCurent >= 2;
  });


  // 3. FUNCȚIE AJUTĂTOARE PENTRU VALIDAREA FORMULARULUI DE GUEST
  isGuestFormValid(): boolean {
    if (this.authService.currentUser()) return true;
    return !!(this.guestFirstName && this.guestLastName && this.guestEmail && this.guestPhone);
  }


  totalPrice = computed(() => {
    // const services = (this.s1.get('service_id')?.value ?? []);
    const services = this.selectedServices() ?? []
    console.log("==|| totalPrice ||== services ==", services)
    return services.reduce((sum: number, s: any) => sum + Number(s.price ?? 0), 0);
  });


  totalDuration = computed(() => {
    // const services = (this.s1.get('service_id')?.value ?? [])
    const services = this.selectedServices() ?? []
    console.log("==|| totalDuration ||== services ==", services)
    return services.reduce((sum: number, s: any) => sum + Number(s.duration_minutes ?? 0), 0);
  });

  formattedDuration = computed(() => {
    const total = this.totalDuration();
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
  });


  confirmBooking(): void {
    // const service = this.selectedServiceCombo();
    // const barber = this.selectedBarberCombo();
    // const date = this.selectedDate();
    // const slot = this.selectedSlot();


    if (this.authService.currentUser()) this.s5.disable();


    if (this.bookingForm.invalid) {
      return;
    }
    //const serviceIds = (this.s1.get('service_id')?.value ?? []).map((s: any) => s.id);
    // const serviceIds = [
    //   this.s1.get('service_id')?.value?.id,
    //   ...(this.s2.get('addon_service_ids')?.value ?? []).map((s: any) => s.id),
    // ];

    const serviceIds = this.selectedServices().map((s: any) => s.id)

    console.log("== || serviceIds || == confirmBooking() ==", serviceIds)
    //const service = this.s1.get('service_id')?.value;
    const barber = this.s3.get('barber_id')?.value;
    const date = this.s4.get('selected_date')?.value;
    const slot = this.s4.get('selected_slot')?.value;


    if (serviceIds && barber && date && slot) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // 4. PREGĂTIREA PAYLOAD-ULUI FLEXIBIL PENTRU SERVICIUL HTTP
      let guestPayload = undefined;
      if (!this.authService.currentUser()) {
        // guestPayload = {
        //   first_name: this.guestFirstName,
        //   last_name: this.guestLastName,
        //   email: this.guestEmail,
        //   phone: this.guestPhone
        // };
        guestPayload = {
          first_name: this.s5.get('first_name')?.value,
          last_name: this.s5.get('last_name')?.value,
          email: this.s5.get('email')?.value,
          phone: this.s5.get('phone')?.value,
        };
        
      }

      console.log("this.bv",this.bv);
      // console.log("==|| confirmBoking ||== serviceIds ==", serviceIds)


      // Trimitem al 4-lea parametru opțional către serviciul tău BarberService
      this.bookingService.createAppointment(serviceIds, barber.id, formattedDate, slot, guestPayload).subscribe({
        next: (response) => {

          console.log(" == || create appoiment || == response == ", response);
          //alert(response.message);

          // Afișare Toast de Succes
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Rezervare Confirmată', 
            detail: response.message,
            life: 4000 
          });

          //this.barberService.loadAvailableSlots(formattedDate, barber.id);
          //this.loadAvailableSlots(formattedDate, barber.id, );
          this.resetFormular();
        },
        error: (err) => {

          //Afișare Toast de Eroare
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Eroare Rezervare', 
            detail: err.error?.error || 'A apărut o eroare la salvarea programării.' 
          });
        }
      }); 
    }
  }

  resetFormular() {
    // 1. Resetăm starea vizuală a stepper-ului înapoi la pasul 1
    const stepperInstance = this.stepperRef();
    if (stepperInstance) {
      // PrimeNG 19 folosește o proprietate internă controlată pentru valoare sau o metodă de navigare
      stepperInstance.value.set(1); 
    }

    this.bookingForm.reset();
    this.selectedSlot.set(null);

    // // 2. Curățăm toate datele selectate din formular
    // this.selectedDate.set(null);
    // this.selectedSlot.set(null);
    // this.selectedServiceCombo.set(null);
    // this.selectedBarberCombo.set(null);
    
    // // 3. Resetăm câmpurile de text pentru oaspeți (dacă au fost completate)
    // this.guestFirstName = '';
    // this.guestLastName = '';
    // this.guestEmail = '';
    // this.guestPhone = '';
  }

  logout(): void { 
    this.authService.logout();
  }

  onAuthButtonClick(): void {
    if (this.authService.currentUser()) {
      this.logout();
    } else {
       this.router.navigate(['/login']);
    }
  }
  
  get bv() {
    return this.bookingForm.value;
  }

  get bf() {
    return this.bookingForm.controls;
  }




}
