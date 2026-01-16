import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItineraryDay } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-itinerary-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-itinerary-widget.html',
  styleUrl: './dashboard-itinerary-widget.scss'
})
export class DashboardItineraryWidgetComponent {
  @Input() days: ItineraryDay[] = [];

  constructor(private router: Router) {}

  goToDay(index: number): void {
    // Navegar a la vista de itinerario con el día seleccionado
    this.router.navigate(['../itinerario'], {
      relativeTo: this.router.routerState.root,
      queryParams: { day: index }
    });
  }

  getDayNumber(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  getMonth(dateString: string): string {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[date.getMonth()];
  }
}
