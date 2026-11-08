import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { RatingDialogComponent } from '../admin-dashboard/components/rating-dialog/rating-dialog.component';
import { RatingModule } from 'primeng/rating';
import { StarRatingDisplayComponent } from '../../shared/star-rating-display/star-rating-display.component';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { BARBER_SHOWCASE_ITEM } from '../../modules/common.interfaces';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-team-presentation',
  imports: [
    CommonModule,
    CarouselModule, 
    ButtonModule,
    TagModule,
    RatingModule,
    RatingDialogComponent,
    StarRatingDisplayComponent,
    ProgressSpinnerModule
    
  ],
  templateUrl: './team-presentation.component.html',
  styleUrl: './team-presentation.component.scss'
})
export class TeamPresentationComponent {

  private commonService = inject(CommonService);
  private router = inject(Router);


  barbers = signal<BARBER_SHOWCASE_ITEM[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  responsiveOptions = [
    // { breakpoint: '1400px', numVisible: 3, numScroll: 1 },
    // { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 1, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  ];

  ngOnInit(): void {
    this.loadBarbers();
  }

  loadBarbers(): void {
    this.loading.set(true);
    this.errorMessage.set(null); 

    this.commonService.loadBarbersShowcase().subscribe({
      next: (response) => {
        console.log("== || loadBarbersShowcase || == response ==", response)
        if (response.success) {
          this.barbers.set(response.data);
        } else {
          this.errorMessage.set('Nu s-a putut încărca echipa.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare la încărcarea echipei:', err);
        this.errorMessage.set('Nu s-a putut încărca echipa.');
        this.loading.set(false);
      },
    });
  }


  bookWithBarber(barberId: number): void {
    this.router.navigate(['/booking'], { queryParams: { barberId } });
  } 
}
