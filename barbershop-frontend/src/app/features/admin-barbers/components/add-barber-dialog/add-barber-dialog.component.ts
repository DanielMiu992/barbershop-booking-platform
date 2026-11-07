import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { REGISTER_FORM_MODEL, SET_FORM_MODEL } from '../../../../modules/admin-barbers.interfaces';
import { matchPasswordValidator, passwordStrengthValidator, roMobilePhoneValidator, specialCharactersValidator } from '@validators/index';
import { AdminBarbersService } from '../../../../services/admin-barbers.service';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { CommonService } from '../../../../services/common.service';
import { Password } from 'primeng/password';
import { Card } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-add-barber-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    InputText,
    Message,
    Password,
    Card,
    FileUploadModule,
    ProgressSpinnerModule,
    AvatarModule
    
  ],
  templateUrl: './add-barber-dialog.component.html',
  styleUrl: './add-barber-dialog.component.scss'
})
export class AddBarberDialogComponent {
  private fb = inject(FormBuilder);
  private adminBarbersService = inject(AdminBarbersService);
  private messageService = inject(MessageService);
  private commonService = inject(CommonService);
  


  visible = model<boolean>(false);
  onSaved = output<void>();
  onCancel = output<void>();

  isSavingBarber = signal<boolean>(false);
  isEditModeDialog = input<boolean>(false);

  setForm!: FormGroup<SET_FORM_MODEL>
  
  registerForm!: FormGroup<REGISTER_FORM_MODEL>;

  avatarPreview = signal<string | undefined>(undefined);
  uploadingAvatar = signal(false);
  uploadError = signal<string | null>(null);


  constructor(){
    // this.setForm = this.fb.group<SET_FORM_MODEL>({
    //   id: this.fb.control(null),
    //   first_name: this.fb.control(null, [Validators.required, specialCharactersValidator()]),
    //   last_name: this.fb.control(null, [Validators.required, specialCharactersValidator()]),
    //   avatar_url: this.fb.control(null),
    //   is_active: this.fb.control(null),
    //   created_at: this.fb.control(null),
    //   rating_avg: this.fb.control(null),
    //   rating_count: this.fb.control(null)

    // },{updateOn: 'submit'})

    this.registerForm = this.fb.group<REGISTER_FORM_MODEL>({
      id: this.fb.control(null),
      last_name: this.fb.control(null, [Validators.required, Validators.maxLength(60), specialCharactersValidator()]),
      first_name: this.fb.control(null, [Validators.required, Validators.maxLength(60), specialCharactersValidator()]),
      email: this.fb.control(null, [Validators.required, Validators.email, Validators.maxLength(60)]),
      phone: this.fb.control(null, [roMobilePhoneValidator()]),
      password: this.fb.control(null, [Validators.required, passwordStrengthValidator()]),
      confirm_password: this.fb.control(null),
      is_active: this.fb.control(true),
      avatar_url: this.fb.control(null)
    }, 
    { 
      validators: matchPasswordValidator(),
      updateOn: 'submit'
    })
    

    // console.log("== || AddBarberDialogComponent || == this.isEditModeDialog ==", this.isEditModeDialog());

  }

  getBarbersDetails(barberId: number){
    
    this.commonService.getBarbersDetails(barberId).subscribe({
      next: (response) => {
        console.log("== || AddBarberDialogComponent || == getBarbersDetails ==", response);
        this.registerForm.patchValue({
          id: response.barber_id,
          first_name: response.first_name,
          last_name: response.last_name,
          is_active: response.is_active,
          phone: response.phone,
          email: response.email,
          avatar_url: response.avatar_url
        })

        this.fsc.password.setValidators([passwordStrengthValidator()]);
        this.fsc.password.updateValueAndValidity();
        this.fsc.password.markAsTouched()
        this.fsc.confirm_password.markAsTouched()
        this.avatarPreview.set(response.avatar_url);

      },
      error: (err) => {
        console.log("==|| getBarbersDetails ||== err == ", err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare', 
          detail: err.error?.message || 'Eroare internă de server la preluarea datelor' 
        });
      }
    })
  }
    
  onAvatarSelected(event: { files: File[] }): void {

    console.log("==|| onAvatarSelected ||== event ==", event);

    const file = event.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.uploadError.set(null);

    console.log("==|| onAvatarSelected ||== file ==", file);

    this.adminBarbersService.uploadAvatar(file).subscribe({
      next: (res) => {
        console.log("==|| uploadAvatar ||== res ==", res)
        this.registerForm.patchValue({ avatar_url: res.avatar_url });
        this.avatarPreview.set(res.avatar_url);
        this.uploadingAvatar.set(false);
      },
      error: (err) => {
        this.uploadError.set(err?.error?.message ?? 'Încărcarea a eșuat.');
        this.uploadingAvatar.set(false);
      },
    });
  }

  saveBarber(): void{
  
    if (this.registerForm.invalid) {
      return;
    }

    this.isSavingBarber.set(true);

    if(!this.fsv.id) this.fsc.is_active.setValue(true);

    const barberPayLoad = this.fsv 

    console.log("==|| saveBarber ||== barberPayLoad ==", barberPayLoad)

    this.adminBarbersService.upsertBarber(barberPayLoad).subscribe({
      next: (response) => {

        console.log("== || upsertService || == response TS == ", response)

        if (response.success) {
          // Afișăm mesajul de succes din DB: 'inregistrarea a fost salvata/actualizata cu succes'
          
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succes', 
            detail: response.message 
          });

          this.isSavingBarber.set(false);
          this.onSaved.emit();
          this.visible.set(false);
          
          
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Eroare', 
            detail: response.message 
          });
          this.isSavingBarber.set(false);
        }
      },
      error: (err) => {
        console.error('Eroare de rețea la salvarea serviciului:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare Critică', 
          detail: 'A apărut o eroare la salvarea înregistrării' 
        });

        this.isSavingBarber.set(false);

      }
    });
  }

  get fsc(){
    return this.registerForm.controls;
    //return this.setForm.controls;
  }

  get fsv(){
    return this.registerForm.value
    //return this.setForm.value;
  }

}
