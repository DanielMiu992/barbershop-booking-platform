import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AdminServicesService } from '../../../../services/admin-services.service';
import { specialCharactersValidator } from '@validators/special-characters.validator';
import { SET_FORM_SP_MODEL, SPECIALTIES_LIST_ITEM } from '../../../../modules/admin-services.interface';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { FluidModule } from 'primeng/fluid';
@Component({
  selector: 'app-add-specialty-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputText,
    Message,
    ToggleSwitchModule,
    TooltipModule,
    FluidModule
  ],
  templateUrl: './add-specialty-dialog.component.html',
  styleUrl: './add-specialty-dialog.component.scss'
})

export class AddSpecialtyDialogComponent {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private adminServicesService = inject(AdminServicesService);

  visibleSpDialog = model<boolean>(false);
  onSavedSp = output<void>();
  onCancelSp = output<void>();

  isSavingSp = signal<boolean>(false);
  isEditModeSpDialog = input<boolean>(false);

  setForm!: FormGroup<SET_FORM_SP_MODEL>

  constructor(){
    this.setForm = this.fb.group<SET_FORM_SP_MODEL>({
      id: this.fb.control(null),
      name: this.fb.control(null, [Validators.required, specialCharactersValidator()]),
      is_active: this.fb.control(null),
    },{updateOn: 'submit'})

  }



  saveSp(): void {
    this.fsc.name.markAsTouched();
    console.log("==|| saveSp ||== this.fsv ==", this.fsv);

    if(this.setForm.invalid){
      return
    }

    this.isSavingSp.set(true);
    const spPayLoad = this.fsv as SPECIALTIES_LIST_ITEM;

    this.adminServicesService.upsertSp(spPayLoad).subscribe({
      next: (response) => {

        console.log("== || upsertSp || == response TS == ", response)

        if (response.success) {
          // Afișăm mesajul de succes din DB: 'inregistrarea a fost salvata/actualizata cu succes'
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succes', 
            detail: response.message 
          });
          
          this.isSavingSp.set(false);
          this.onSavedSp.emit();
          this.visibleSpDialog.set(false);
        } else {
          // Afișăm mesajul de eroare din DB
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Eroare', 
            detail: response.message 
          });

          this.isSavingSp.set(false);
        }
      },
      error: (err) => {
        console.error('Eroare de rețea la salvarea sp:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Eroare Critică', 
          detail: 'A apărut o eroare la salvarea înregistrării' 
        });

        this.isSavingSp.set(false);
      }
    });

  }

  get fsc(){
    return this.setForm.controls;
  }

  get fsv(){
    return this.setForm.value;
  }


}
