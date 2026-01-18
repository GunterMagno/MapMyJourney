import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TripService } from '../../../../core/services/trip.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AutoSaveStateService } from '../../../../core/services/auto-save-state.service';
import { Subject, debounceTime } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface TripSettings {
  id: number;
  name: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-trip-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-settings.html',
  styleUrl: './trip-settings.scss'
})
export class TripSettingsComponent implements OnInit, OnDestroy {
  tripSettings: TripSettings = {
    id: 0,
    name: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: ''
  };

  originalSettings: TripSettings = { ...this.tripSettings };
  isLoading = false;
  isSaved = true;
  errorMessage = '';
  successMessage = '';
  isAutoSaving = false;

  private destroy$ = new Subject<void>();
  private autoSaveSubject$ = new Subject<void>();
  private tripId: number = 0;

  constructor(
    private tripService: TripService,
    private toastService: ToastService,
    private autoSaveStateService: AutoSaveStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Register auto-save callback for sidebar button
    this.autoSaveStateService.registerSaveCallback(async () => {
      return new Promise((resolve, reject) => {
        this.performAutoSave(resolve, reject);
      });
    });

    // Auto-save logic with 2.5 minute debounce
    this.autoSaveSubject$
      .pipe(
        debounceTime(150000), // 2.5 minutes
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.autoSave();
      });

    this.route.parent?.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.tripId = parseInt(params['id'], 10);
      this.loadTripSettings();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.autoSaveStateService.registerSaveCallback(null as any);
  }

  loadTripSettings(): void {
    this.isLoading = true;
    this.tripService.getTripById(this.tripId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (trip: any) => {
        this.tripSettings = {
          id: trip.id,
          name: trip.name || '',
          destination: trip.destination || '',
          description: trip.description || '',
          startDate: this.formatDateForInput(trip.startDate),
          endDate: this.formatDateForInput(trip.endDate)
        };
        this.originalSettings = JSON.parse(JSON.stringify(this.tripSettings));
        this.isLoading = false;
        this.clearMessages();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la configuración del viaje';
        this.isLoading = false;
        console.error('Error loading trip:', error);
      }
    });
  }

  saveSettings(): void {
    if (!this.validateForm()) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    const updateData = {
      name: this.tripSettings.name,
      destination: this.tripSettings.destination,
      description: this.tripSettings.description,
      startDate: this.formatDateForServer(this.tripSettings.startDate),
      endDate: this.formatDateForServer(this.tripSettings.endDate)
    };

    this.tripService.updateTrip(this.tripId.toString(), updateData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.originalSettings = JSON.parse(JSON.stringify(this.tripSettings));
        this.isSaved = true;
        this.successMessage = 'Configuración guardada correctamente';
        this.isLoading = false;
        this.clearSuccessMessage();
      },
      error: (error) => {
        this.errorMessage = 'Error al guardar la configuración';
        this.isLoading = false;
        console.error('Error updating trip:', error);
      }
    });
  }

  undoChanges(): void {
    this.tripSettings = JSON.parse(JSON.stringify(this.originalSettings));
    this.isSaved = true;
    this.errorMessage = '';
  }

  onFieldChange(): void {
    const isCurrentlySaved = JSON.stringify(this.tripSettings) === JSON.stringify(this.originalSettings);
    
    if (this.isSaved && !isCurrentlySaved) {
      // Changes detected
      this.isSaved = false;
      this.autoSaveStateService.setIsSaved(false);
      console.log('✏️ Cambios detectados, iniciando auto-save en 2.5 minutos');
      this.autoSaveSubject$.next();
    } else if (!this.isSaved && isCurrentlySaved) {
      // Changes reverted
      this.isSaved = true;
      this.autoSaveStateService.setIsSaved(true);
      console.log('✅ Cambios revertidos');
    }
  }

  private autoSave(): void {
    this.performAutoSave(() => {}, () => {});
  }

  private performAutoSave(resolve: () => void, reject: () => void): void {
    if (this.isSaved) {
      console.log('⏭️ Sin cambios, ignorando auto-save');
      resolve();
      return;
    }

    if (!this.validateForm()) {
      console.log('⚠️ Formulario inválido, no se puede guardar');
      reject();
      return;
    }

    this.isAutoSaving = true;
    this.autoSaveStateService.setIsAutoSaving(true);
    console.log('💾 Guardando cambios automáticamente...');

    const updateData = {
      name: this.tripSettings.name,
      destination: this.tripSettings.destination,
      description: this.tripSettings.description,
      startDate: this.formatDateForServer(this.tripSettings.startDate),
      endDate: this.formatDateForServer(this.tripSettings.endDate)
    };

    this.tripService.updateTrip(this.tripId.toString(), updateData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.originalSettings = JSON.parse(JSON.stringify(this.tripSettings));
        this.isSaved = true;
        this.isAutoSaving = false;
        this.autoSaveStateService.setIsAutoSaving(false);
        this.autoSaveStateService.setIsSaved(true);
        this.toastService.success('Configuración guardada correctamente');
        console.log('✅ Auto-save completado');
        resolve();
      },
      error: (error) => {
        this.isAutoSaving = false;
        this.autoSaveStateService.setIsAutoSaving(false);
        this.toastService.error('Error al guardar la configuración');
        console.error('❌ Error en auto-save:', error);
        reject();
      }
    });
  }

  private validateForm(): boolean {
    return !!(
      this.tripSettings.name.trim() &&
      this.tripSettings.destination.trim() &&
      this.tripSettings.description.trim() &&
      this.tripSettings.startDate &&
      this.tripSettings.endDate &&
      new Date(this.tripSettings.startDate) < new Date(this.tripSettings.endDate)
    );
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForServer(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
  }

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
