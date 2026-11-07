import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { RatingDialogComponent } from '../admin-dashboard/components/rating-dialog/rating-dialog.component';
import { RatingModule } from 'primeng/rating';
import { StarRatingDisplayComponent } from '../../shared/star-rating-display/star-rating-display.component';

@Component({
  selector: 'app-team-presentation',
  imports: [
    CommonModule,
    CarouselModule, 
    ButtonModule,
    TagModule,
    RatingModule,
    RatingDialogComponent,
    StarRatingDisplayComponent
    
  ],
  templateUrl: './team-presentation.component.html',
  styleUrl: './team-presentation.component.scss'
})
export class TeamPresentationComponent {

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  ];

  router: any;

  bookWithBarber(barberId: number): void {
    this.router.navigate(['/booking'], { queryParams: { barberId } });
  } 
}
