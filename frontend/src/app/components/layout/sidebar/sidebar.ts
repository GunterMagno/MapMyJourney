import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para un enlace de navegación del sidebar
 */
export interface SidebarNavLink {
  label: string;           // Texto del enlace (ej: "Dashboard")
  route: string;           // Ruta relativa (ej: "dashboard")
  icon: string;            // Path del icono SVG
  badge?: number;          // Opcional: número de notificaciones
}

/**
 * Interfaz para la información del viaje mostrada en el sidebar
 */
export interface TripSidebarInfo {
  id: number;
  title: string;           // Título del viaje
  destination: string;     // Destino del viaje
  startDate: string;       // Fecha de inicio (ISO)
  endDate: string;         // Fecha de fin (ISO)
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  // Información del viaje
  @Input() tripInfo?: TripSidebarInfo;
  
  // Enlaces de navegación
  @Input() navLinks: SidebarNavLink[] = [];
  
  // Estado de colapso (para móvil)
  isCollapsed = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializar navegación si no se proporciona desde el padre
    if (this.navLinks.length === 0) {
      this.initializeDefaultNavLinks();
    }
  }

  /**
   * Inicializa los enlaces de navegación por defecto
   */
  private initializeDefaultNavLinks(): void {
    this.navLinks = [
      { 
        label: 'Dashboard', 
        route: 'dashboard', 
        icon: '/assets/icons/sidebar/dashboard.svg' 
      },
      { 
        label: 'Itinerario', 
        route: 'itinerario', 
        icon: '/assets/icons/sidebar/itinerary.svg' 
      },
      { 
        label: 'Gastos', 
        route: 'gastos', 
        icon: '/assets/icons/sidebar/expenses.svg' 
      },
      { 
        label: 'Documentos', 
        route: 'documentos', 
        icon: '/assets/icons/sidebar/documents.svg',
        badge: 0
      },
      { 
        label: 'Votaciones', 
        route: 'votaciones', 
        icon: '/assets/icons/sidebar/votes.svg' 
      },
      { 
        label: 'Compartir', 
        route: 'compartir', 
        icon: '/assets/icons/sidebar/share.svg' 
      }
    ];
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Abre el chat en una nueva ventana o modal
   */
  openChat(): void {
    // TODO: Implementar apertura de chat
    console.log('Abriendo chat...');
  }

  /**
   * Formatea las fechas para mostrar en formato corto
   * @example "Feb 18 - Jun 04"
   */
  getFormattedDates(): string {
    if (!this.tripInfo) return '';
    
    const start = new Date(this.tripInfo.startDate);
    const end = new Date(this.tripInfo.endDate);
    
    const formatDate = (date: Date) => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  /**
   * Obtiene el destino formateado
   */
  getDestination(): string {
    return this.tripInfo?.destination || '';
  }
}
