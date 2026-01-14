import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentItem } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-documents-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-documents-widget.html',
  styleUrl: './dashboard-documents-widget.scss'
})
export class DashboardDocumentsWidgetComponent {
  @Input() documents: DocumentItem[] = [];

  get totalCompleted(): number {
    return this.documents.filter(doc => doc.isComplete).length;
  }

  uploadFile(event: Event, doc: DocumentItem): void {
    event.preventDefault();
    console.log('Subir archivo para:', doc.name);
    // TODO: Implementar lógica de subida de archivos
  }
}
