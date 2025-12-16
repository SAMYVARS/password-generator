import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  confirmPassword = '';
  isRegisterMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    // Si déjà connecté, rediriger vers la page de génération
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.isRegisterMode && this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.isRegisterMode) {
      this.authService.register(this.username, this.password).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Compte créé ! Redirection...';
            setTimeout(() => this.router.navigate(['/']), 1000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
        }
      });
    } else {
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/']);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur de connexion';
        }
      });
    }
  }

  switchMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.confirmPassword = '';
  }
}

