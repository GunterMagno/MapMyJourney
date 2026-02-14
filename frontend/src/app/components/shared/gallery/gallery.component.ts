import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  trackByImageId(index: number, image: GalleryImage): number {
    return image.id;
  }

  images: GalleryImage[] = [
    {
      id: 1,
      src: 'https://picsum.photos/400/300?random=1',
      alt: 'Vista panorámica de la Torre Eiffel al atardecer en París, con los edificios históricos iluminados al fondo',
      caption: 'Atardecer en París',
    },
    {
      id: 2,
      src: 'https://picsum.photos/400/300?random=2',
      alt: 'Playas de arena blanca con aguas turquesas del Caribe durante el mediodía, palmeras en primer plano',
      caption: 'Paradiso Caribeño',
    },
    {
      id: 3,
      src: 'https://picsum.photos/400/300?random=3',
      alt: 'Templo budista con arquitectura tradicional asiática rodeado de vegetación tropical y montañas',
      caption: 'Templo en Tailandia',
    },
    {
      id: 4,
      src: 'https://picsum.photos/400/300?random=4',
      alt: 'Grandes pirámides de Giza en el desierto de Egipto bajo un cielo despejado durante el día',
      caption: 'Pirámides de Giza',
    },
    {
      id: 5,
      src: 'https://picsum.photos/400/300?random=5',
      alt: 'Paisaje montañoso con picos nevados de los Alpes suizos reflejados en un lago alpino cristalino',
      caption: 'Alpes Suizos',
    },
    {
      id: 6,
      src: 'https://picsum.photos/400/300?random=6',
      alt: 'Calle colorida de la ciudad vieja de Estambul con arquitectura otomana y turistas visitando bazares tradicionales',
      caption: 'Gran Bazar de Estambul',
    },
  ];
}
