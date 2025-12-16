import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './page-login.html',
  styleUrl: './page-login.scss'
})
export class PageLogin {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  errorMessage: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';

    // Validation simple
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    // Simulation de connexion (à remplacer par un vrai service)
    console.log('Login attempt:', { email: this.email, password: this.password });

    // Pour l'instant, on navigue vers la page d'accueil
    this.router.navigate(['/']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}

