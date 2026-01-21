import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para formateo de fechas
 * Asegura consistencia en todo el formato de fechas: DD-MM-YYYY
 */
@Injectable({
  providedIn: 'root'
})
export class DateFormatService {
  
  /**
   * Convierte una fecha a formato DD-MM-YYYY para mostrar en UI
   * @param dateString ISO string o date
   * @returns Fecha formateada como DD-MM-YYYY
   */
  formatDisplayDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }

  /**
   * Convierte una fecha a formato YYYY-MM-DD para input[type="date"]
   * @param dateString ISO string o date
   * @returns Fecha formateada como YYYY-MM-DD
   */
  formatInputDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Normaliza una fecha a formato YYYY-MM-DD (ISO sin hora)
   * @param dateString ISO string o date
   * @returns Fecha formateada como YYYY-MM-DD
   */
  normalizeDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toISOString().split('T')[0];
  }

  /**
   * Extrae el día y mes formateados para mostrar en selector compacto
   * @param dateString ISO string o date
   * @returns { day: number, month: string (3 letras) }
   */
  getDateParts(dateString: string | Date): { day: number; month: string } {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()]
    };
  }

  /**
   * Compara dos fechas ignorando la hora
   * @returns -1 si date1 < date2, 0 si igual, 1 si date1 > date2
   */
  compareDates(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    const time1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const time2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    
    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * Verifica si una fecha está dentro de un rango
   * @returns true si start <= date <= end
   */
  isDateInRange(date: string | Date, start: string | Date, end: string | Date): boolean {
    return this.compareDates(date, start) >= 0 && this.compareDates(date, end) <= 0;
  }
}
