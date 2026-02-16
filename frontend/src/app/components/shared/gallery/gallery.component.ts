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
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {
  images: GalleryImage[] = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      alt: 'Vista aérea de una playa tropical con aguas cristalinas turquesas y arena blanca',
      caption: 'Playas Paradisíacas'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      alt: 'Montañas nevadas iluminadas por la luz dorada del atardecer con un cielo naranja',
      caption: 'Cumbres Nevadas'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
      alt: 'Templo antiguo de arquitectura asiática rodeado de vegetación verde exuberante',
      caption: 'Templos Milenarios'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&h=600&fit=crop',
      alt: 'Grandes pirámides de piedra en el desierto bajo un cielo azul despejado',
      caption: 'Maravillas Antiguas'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      alt: 'Lago alpino cristalino que refleja los picos nevados de las montañas circundantes',
      caption: 'Lagos de Montaña'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
      alt: 'Calle colorida de ciudad antigua con arquitectura histórica y turistas pasando por bazares',
      caption: 'Calles del Mundo'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop',
      alt: 'Bosque verde exuberante con árboles altos y rayos de luz solar atravesando el follaje',
      caption: 'Bosques Tropicales'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
      alt: 'Playa con palmera solitaria y atardecer rojo reflejado en el agua tranquila',
      caption: 'Atardeceres Mágicos'
    },
    {
      id: 9,
      src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      alt: 'Ciudades modernas con rascacielos iluminados al anochecer y luces de neón',
      caption: 'Metrópolis Urbanas'
    },
    {
      id: 10,
      src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop',
      alt: 'Acantilados rocosos junto a un océano azul profundo con olas espumosas',
      caption: 'Costas Salvajes'
    }
  ];

  trackByImageId(index: number, image: GalleryImage): number {
    return image.id;
  }
}
