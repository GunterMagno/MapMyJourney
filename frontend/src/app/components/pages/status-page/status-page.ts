import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  endpoint: string;
}

@Component({
  selector: 'app-status-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './status-page.html',
  styleUrl: './status-page.scss',
})
export class StatusPageComponent implements OnInit, OnDestroy {
  services: ServiceStatus[] = [
    { name: 'Frontend', status: 'checking', endpoint: window.location.origin },
    { name: 'Backend - Auth', status: 'checking', endpoint: 'http://localhost:8080/api/health/auth' },
    { name: 'Backend - Trips', status: 'checking', endpoint: 'http://localhost:8080/api/health/trips' },
    { name: 'Backend - Users', status: 'checking', endpoint: 'http://localhost:8080/api/health/users' },
  ];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkAllServices();
    // Recargar estado cada 30 segundos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.checkAllServices());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAllServices() {
    this.services.forEach((service, index) => {
      if (index === 0) {
        // Frontend siempre está online si la página carga
        this.services[index].status = 'online';
      } else {
        this.checkService(service);
      }
    });
  }

  checkService(service: ServiceStatus) {
    this.http.get(service.endpoint, { responseType: 'text' })
      .subscribe({
        next: () => {
          service.status = 'online';
        },
        error: () => {
          service.status = 'offline';
        }
      });
  }

  getStatusColor(status: ServiceStatus['status']): string {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      case 'checking':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  getStatusText(status: ServiceStatus['status']): string {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'offline':
        return 'Sin conexión';
      case 'checking':
        return 'Verificando...';
      default:
        return 'Desconocido';
    }
  }
}
