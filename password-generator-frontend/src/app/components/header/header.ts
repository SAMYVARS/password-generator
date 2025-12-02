import { Component } from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconButton,
    MatIconModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isLoggedIn = false;
  isLoginPage = false;

  constructor(private router: Router) {
    // Détecter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url === '/login';
      });

    // Vérifier la route initiale
    this.isLoginPage = this.router.url === '/login';
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
