import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Poll, PollOption } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-polls-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-polls-widget.html',
  styleUrl: './dashboard-polls-widget.scss'
})
export class DashboardPollsWidgetComponent {
  @Input() polls: Poll[] = [];

  getPercentage(votes: number, options: PollOption[]): number {
    const total = options.reduce((sum, opt) => sum + opt.votes, 0);
    return total > 0 ? (votes / total) * 100 : 0;
  }
}
