import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Importar componentes
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

// Interfaces
interface Activity {
  icon: string;
  title: string;
  time: string;
  location: string;
}

interface ItineraryDay {
  date: Date;
  title: string;
  description: string;
  activities: Activity[];
}

interface VotingOption {
  label: string;
  votes: number;
  userVoted: boolean;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  options: VotingOption[];
  totalVotes: number;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'spreadsheet';
  uploadedBy: string;
  date: Date;
}

interface Participant {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
}

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.scss'
})
export class TripDetailComponent implements OnInit {
  // Trip Data
  tripId: string = '';
  tripName: string = 'Viaje a París';
  tripStartDate: Date = new Date(2024, 5, 10);
  tripEndDate: Date = new Date(2024, 5, 17);
  tripLocation: string = 'Francia';
  participantsCount: number = 4;

  // UI State
  activeSection: 'itinerary' | 'voting' | 'documents' | 'expenses' = 'itinerary';
  mobileMenuOpen: boolean = false;

  // Data Collections
  participants: Participant[] = [];
  itineraryDays: ItineraryDay[] = [];
  proposals: Proposal[] = [];
  documents: Document[] = [];
  expenses: Expense[] = [];

  // Calculated Values
  totalExpenses: number = 0;
  expensePerPerson: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener ID del viaje de la ruta
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    
    // Cargar datos (TODO: reemplazar con servicio real)
    this.loadTripData();
  }

  /**
   * Carga los datos del viaje desde el servicio
   */
  private loadTripData(): void {
    // TODO: Reemplazar con llamada al servicio
    // this.tripService.getTripDetail(this.tripId).subscribe(trip => { ... });

    // MOCK DATA
    this.loadMockData();
  }

  /**
   * Carga datos mockeados para demostración
   */
  private loadMockData(): void {
    // Participantes
    this.participants = [
      { id: '1', name: 'Juan Pérez' },
      { id: '2', name: 'María García' },
      { id: '3', name: 'Carlos López' },
      { id: '4', name: 'Ana Martínez' }
    ];

    // Itinerario
    this.itineraryDays = [
      {
        date: new Date(2024, 5, 10),
        title: 'Llegada a París',
        description: 'Vuelo desde el aeropuerto y traslado al hotel',
        activities: [
          {
            icon: '✈️',
            title: 'Vuelo de llegada',
            time: '10:00 AM',
            location: 'Aeropuerto Charles de Gaulle'
          },
          {
            icon: '🏨',
            title: 'Check-in en el hotel',
            time: '4:00 PM',
            location: 'Hotel Central Paris'
          },
          {
            icon: '🍽️',
            title: 'Cena de bienvenida',
            time: '8:00 PM',
            location: 'Restaurante Le Petit Bistro'
          }
        ]
      },
      {
        date: new Date(2024, 5, 11),
        title: 'Exploración del centro',
        description: 'Visita a monumentos icónicos de París',
        activities: [
          {
            icon: '🗼',
            title: 'Torre Eiffel',
            time: '9:00 AM',
            location: 'Trocadéro'
          },
          {
            icon: '🚢',
            title: 'Crucero por el Sena',
            time: '2:00 PM',
            location: 'Puerto de Pont de l\'Alma'
          },
          {
            icon: '🎨',
            title: 'Museo del Louvre',
            time: '5:00 PM',
            location: 'Palacio del Louvre'
          }
        ]
      }
    ];

    // Votaciones
    this.proposals = [
      {
        id: '1',
        title: '¿Qué restaurante para la cena de hoy?',
        description: 'Selecciona tu opción favorita para la cena del viernes',
        options: [
          { label: 'Le Petit Bistro', votes: 8, userVoted: false },
          { label: 'Chez Maxim\'s', votes: 5, userVoted: true },
          { label: 'L\'Astrance', votes: 3, userVoted: false }
        ],
        totalVotes: 16
      },
      {
        id: '2',
        title: 'Actividad del sábado',
        description: '¿Qué prefieres hacer el sábado por la tarde?',
        options: [
          { label: 'Tour de museos', votes: 6, userVoted: false },
          { label: 'Compras en Champs-Élysées', votes: 7, userVoted: true },
          { label: 'Picnic en el parque', votes: 4, userVoted: false }
        ],
        totalVotes: 17
      }
    ];

    // Documentos
    this.documents = [
      {
        id: '1',
        name: 'Boletos de vuelo.pdf',
        type: 'pdf',
        uploadedBy: 'Juan Pérez',
        date: new Date(2024, 4, 1)
      },
      {
        id: '2',
        name: 'Reserva hotel.pdf',
        type: 'pdf',
        uploadedBy: 'María García',
        date: new Date(2024, 4, 5)
      },
      {
        id: '3',
        name: 'Mapa de París.jpg',
        type: 'image',
        uploadedBy: 'Carlos López',
        date: new Date(2024, 4, 10)
      },
      {
        id: '4',
        name: 'Presupuesto compartido.xlsx',
        type: 'spreadsheet',
        uploadedBy: 'Ana Martínez',
        date: new Date(2024, 4, 15)
      }
    ];

    // Gastos
    this.expenses = [
      {
        id: '1',
        category: 'Vuelos',
        description: 'Vuelos internacionales (4 personas)',
        amount: 2400,
        paidBy: 'Juan Pérez',
        date: new Date(2024, 4, 1)
      },
      {
        id: '2',
        category: 'Hotel',
        description: 'Alojamiento 7 noches',
        amount: 1400,
        paidBy: 'María García',
        date: new Date(2024, 4, 5)
      },
      {
        id: '3',
        category: 'Comida',
        description: 'Desayunos y almuerzos',
        amount: 420,
        paidBy: 'Carlos López',
        date: new Date(2024, 5, 11)
      },
      {
        id: '4',
        category: 'Actividades',
        description: 'Entrada a museos y tours',
        amount: 280,
        paidBy: 'Ana Martínez',
        date: new Date(2024, 5, 12)
      },
      {
        id: '5',
        category: 'Transporte',
        description: 'Metro y taxis',
        amount: 150,
        paidBy: 'Juan Pérez',
        date: new Date(2024, 5, 11)
      }
    ];

    // Calcular totales
    this.calculateExpenses();
  }

  /**
   * Calcula los gastos totales
   */
  private calculateExpenses(): void {
    this.totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    this.expensePerPerson = this.totalExpenses / this.participantsCount;
  }

  /**
   * Cambia la sección activa
   */
  switchSection(section: 'itinerary' | 'voting' | 'documents' | 'expenses'): void {
    this.activeSection = section;
    this.mobileMenuOpen = false; // Cerrar menú en móvil
    
    // Scroll suave a la sección
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  /**
   * Alterna el menú móvil
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /**
   * Obtiene las iniciales de un nombre
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Obtiene el icono del documento según su tipo
   */
  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      pdf: '📕',
      image: '🖼️',
      document: '📄',
      spreadsheet: '📊'
    };
    return icons[type] || '📄';
  }

  /**
   * Descarga un documento
   */
  downloadDocument(docId: string): void {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      console.log('Descargando:', doc.name);
      // TODO: Implementar lógica real de descarga
    }
  }
}
