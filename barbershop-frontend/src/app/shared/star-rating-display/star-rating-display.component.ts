import { Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { getStarIconClass, roundForStarDisplay } from '../../helpers/star-rating-display.helper';

@Component({
  selector: 'app-star-rating-display',
  standalone: true,
  imports: [
    TooltipModule
  ],
  templateUrl: './star-rating-display.component.html',
  styleUrl: './star-rating-display.component.scss'
})
export class StarRatingDisplayComponent {
  rating = input<number>(0);
  reviewCount = input<number | null>(null);
  tooltipOverride = input<string | null>(null);
  starsCount = input<number>(5);
  color = input<string>('var(--p-button-text-warn-color)');
  size = input<string>('0.5rem');
  lowThreshold = input<number>(0.3);
  highThreshold = input<number>(0.7);


  starPositions = computed(() =>
    Array.from({ length: this.starsCount() }, (_, i) => i + 1)
  );

  displayValue = computed(() =>
    roundForStarDisplay(this.rating() ?? 0, {
      low: this.lowThreshold(),
      high: this.highThreshold(),
    })
  );

  tooltipText = computed(() => {
    const override = this.tooltipOverride();
    if (override != null) {
      return override;
    }
    const count = this.reviewCount();
    // return count != null ? `${this.rating()} (${count} recenzii)` : `${this.rating()}`;
    return count != null ? `${this.rating()} (${count} recenzii)` : ``;
  });

  starClass(position: number): string {
    return getStarIconClass(this.displayValue(), position);
  }
}
