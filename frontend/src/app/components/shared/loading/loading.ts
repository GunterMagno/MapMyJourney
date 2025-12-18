import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

/**
 * Loading overlay component.
 * Features:
 * - Shows a spinner/overlay when LoadingService indicates loading
 * - Unidirectional Data Flow: subscribes to LoadingService
 * - FASE 2: Services and RxJS implementation
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class LoadingComponent implements OnInit, OnDestroy {
  isLoading$: any;

  private destroy$ = new Subject<void>();

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.isLoading$ = this.loadingService.isLoading$
      .pipe(
        map(counter => counter > 0)
      );

    // Subscribe to toggle body class
    this.loadingService.isLoading$
      .pipe(
        map(counter => counter > 0),
        takeUntil(this.destroy$)
      )
      .subscribe((isLoading: boolean) => {
        if (isLoading) {
          document.body.classList.add('loading-active');
        } else {
          document.body.classList.remove('loading-active');
        }
      });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('loading-active');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
