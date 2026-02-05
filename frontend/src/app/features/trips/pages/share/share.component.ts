import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { TripMemberService } from '../../../../services/trip-member.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent implements OnInit, OnDestroy {
  emailToInvite: string = '';
  tripId: number = 0;
  inviteError: string = '';
  inviteSuccess: string = '';
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private tripMemberService: TripMemberService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el ID del viaje de la URL
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.tripId = +params['tripId'];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inviteUserByEmail(): void {
    // Validar email
    if (!this.emailToInvite || !this.isValidEmail(this.emailToInvite)) {
      this.inviteError = 'Por favor introduce un email válido';
      this.inviteSuccess = '';
      return;
    }

    this.isLoading = true;
    this.inviteError = '';
    this.inviteSuccess = '';

    // Llamar al servicio que invita al usuario
    this.tripMemberService.inviteUserByEmail(this.tripId, this.emailToInvite).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.inviteSuccess = 'Usuario invitado correctamente al viaje';
        this.inviteError = '';
        this.emailToInvite = ''; // Limpiar el input
        this.isLoading = false;
      },
      error: (error) => {
        this.inviteError = error.error?.message || 'Error al invitar usuario. Verifica que el email sea válido.';
        this.inviteSuccess = '';
        this.isLoading = false;
      }
    });
  }

  /**
   * Valida si el email tiene formato correcto
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
