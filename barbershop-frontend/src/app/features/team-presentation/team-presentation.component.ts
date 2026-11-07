import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-team-presentation',
  imports: [
    CommonModule,
    CarouselModule
  ],
  templateUrl: './team-presentation.component.html',
  styleUrl: './team-presentation.component.scss'
})
export class TeamPresentationComponent {

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  ];

  bookWithBarber(barberId: number): void {
    this.router.navigate(['/booking'], { queryParams: { barberId } });
  } 
}
