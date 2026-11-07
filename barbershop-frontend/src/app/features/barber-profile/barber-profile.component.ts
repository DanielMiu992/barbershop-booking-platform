import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchPasswordValidator, passwordStrengthValidator, roMobilePhoneValidator, specialCharactersValidator } from '@validators/index';
import { MessageService } from 'primeng/api';
import { BarberProfileService } from '../../services/barber-profile.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { StarRatingDisplayComponent } from '../../shared/star-rating-display/star-rating-display.component';
import { Card } from 'primeng/card';
import { Avatar } from 'primeng/avatar';
import { TextareaModule } from 'primeng/textarea';
import { ComboBoxService } from '../../services/combo-box.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { forkJoin } from 'rxjs';

import { ChipModule } from 'primeng/chip';
import { AuthService } from '../../core/auth/auth.service';
import { descriptionValidator } from '@validators/description.validator';

const DAY_NAMES = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

@Component({
  selector: 'app-barber-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    PasswordModule, 
    MessageModule, 
    TagModule, 
    FileUploadModule, 
    ToastModule, 
    StarRatingDisplayComponent,
    Card,
    Avatar,
    TextareaModule,
    MultiSelectModule,
    ChipModule
  ],
  providers: [MessageService],
  templateUrl: './barber-profile.component.html',
  styleUrl: './barber-profile.component.scss'
})
export class BarberProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private barberProfileService = inject(BarberProfileService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  comboBoxService = inject(ComboBoxService)

  profile = signal<any>(null);
  loading = signal(false);
  savingProfile = signal(false);
  savingPassword = signal(false);
  avatarPreview = signal<string | undefined>(undefined);
  uploadingAvatar = signal(false);

  isBarber = computed(() => this.authService.currentUser()?.role === 'barber');


  dayNames = DAY_NAMES;

  profileForm = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), specialCharactersValidator()]],
    last_name: ['', [Validators.required, Validators.minLength(2),  Validators.maxLength(60), specialCharactersValidator()]],
    phone: ['', [Validators.required, roMobilePhoneValidator()]],
    avatar_url: [''],

    //barber fields
    bio: ['', [Validators.maxLength(500), descriptionValidator()]],
    specialty_ids: [''],
  }, {updateOn: 'submit'});

  passwordForm = this.fb.group(
    {
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirm_password: ['', Validators.required],
    },
    { validators: matchPasswordValidator() }
  );

  ngOnInit(): void {
    this.loadProfile();

    if(this.isBarber()) this.comboBoxService.loadSpCombo();
   
  }



  loadProfile(): void {
    this.loading.set(true);

    const request$ = this.isBarber() ? this.barberProfileService.getBarberProfile() : this.barberProfileService.getCustomerProfile();

    request$.subscribe({
      next: (res) => {

        console.log("==|| getMyProfile ||== res ==", res)

        if (res.success && res.data) {
          this.profile.set(res.data);
          this.profileForm.patchValue({
            ...res.data,
            specialty_ids: res.data.specialties
          });

          // console.log("==|| this.profileForm.value ||==", this.profileForm.value)
          this.avatarPreview.set(res.data.avatar_url ?? null);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add(
          { 
            severity: 'error', 
            summary: 'Eroare', 
            detail: 'Nu s-a putut încărca profilul.' 
          });
        this.loading.set(false);
      },
    });
  }

  onAvatarSelected(event: { files: File[] }): void {
    const file = event.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.barberProfileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.profileForm.patchValue({ avatar_url: res.avatar_url });
        this.avatarPreview.set(res.avatar_url);
        this.uploadingAvatar.set(false);
      },
      error: (err) => {
        this.messageService.add(
          { 
            severity: 'error', 
            summary: 'Eroare', 
            detail: err?.error?.message ?? 'Încărcarea a eșuat.' 
          });
        this.uploadingAvatar.set(false);
      },
    });
  }

  onSaveProfile(): void {

    console.log("==|| this.prffc.bio.errors ||==", this.prffc.bio.errors)
    
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);

    const { specialty_ids, bio, ...common } = this.profileForm.value;

    // console.log("==|| specialty_ids || ==", specialty_ids)

    // const mapped =  specialty_ids?.map((sp:any) => sp.id) as Array<number>

    // console.log("==|| mapped ||==", mapped)

    if(this.isBarber()){
      forkJoin({
        profile: this.barberProfileService.updateBarberProfile({...common, bio}),
        specialties: this.barberProfileService.setBarberSpecialties(specialty_ids ?? []),
      }).subscribe({
        next: (res) => { 

          console.log("==|| forkJoin ||== res ==", res)
          if(res.profile.success && res.specialties.success){
            this.messageService.add({
              severity: 'success',
              summary: 'Salvat',
              detail: 'Date actualizate',
            });

          }else{
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Eroare', 
              detail: 'Salvarea a eșuat.' 
            });

          }
          /* toast succes, reîncarcă */ 
          this.savingProfile.set(false);
          this.loadProfile();
          
        },
        error: (err) => { 

          console.log("==|| forkJoin ||== err ==", err)
          /* toast eroare */ 
          this.messageService.add(
            { 
              severity: 'error', 
              summary: 'Eroare', 
              detail: 'Salvarea a eșuat.' 
            });
          this.savingProfile.set(false);
          
        },
      });
    }else{
      this.barberProfileService.updateCustomerProfile(common).subscribe({ 
        next: (res) => { 
          console.log("==|| updateCustomerProfile ||== res ==", res)
          this.messageService.add({
            severity: 'success',
            summary: 'Salvat',
            detail: 'Date actualizate',
          });

          this.savingProfile.set(false);
          this.loadProfile();


        },
        error: (err) => {
          console.log("==|| updateCustomerProfile ||== err ==", err)
          this.messageService.add(
            { 
              severity: 'error', 
              summary: 'Eroare', 
              detail: 'Salvarea a eșuat.' 
            });
          this.savingProfile.set(false);
          
        }
       });
    }



    // this.barberProfileService.updateMyProfile(this.profileForm.value).subscribe({
    //   next: (res) => {
    //     this.messageService.add({
    //       severity: res.success ? 'success' : 'error',
    //       summary: res.success ? 'Salvat' : 'Eroare',
    //       detail: res.message,
    //     });
    //     this.savingProfile.set(false);
    //     if (res.success) this.loadProfile();
    //   },
    //   error: () => {
    //     this.messageService.add(
    //       { 
    //         severity: 'error', 
    //         summary: 'Eroare', 
    //         detail: 'Salvarea a eșuat.' 
    //       });
    //     this.savingProfile.set(false);
    //   },
    // });

  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword.set(true);
    const { current_password, new_password, confirm_password } = this.passwordForm.value;

    this.barberProfileService.changePassword(current_password!, new_password!, confirm_password!).subscribe({
      next: (res) => {
        this.messageService.add(
          { 
            severity: 'success', 
            summary: 'Succes', 
            detail: res.message 
          });
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: (err) => {
        console.log("==|| changePassword ||== err ==", err)
        if(err.status == 400){
          this.pfc.current_password.setErrors({notCurrentPassword: true});
        }else{
          this.messageService.add(
            { 
              severity: 'error', 
              summary: 'Eroare', 
              detail: err?.error?.message ?? 'Schimbarea parolei a eșuat.' 
            });

        }
        

        this.savingPassword.set(false);
      },
    });
  }

  get prffc(){
    return this.profileForm.controls;
  }

  get pfc(){
    return this.passwordForm.controls;
    //return this.setForm.controls;
  }

  get pfv(){
    return this.passwordForm.value
    //return this.setForm.value;
  }



}
