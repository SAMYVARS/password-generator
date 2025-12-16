import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

interface SavedPassword {
  id: number;
  service_name: string;
  password: string;
  created_at: string;
  visible?: boolean;
}

@Component({
  selector: 'app-page-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './page-profile.html',
  styleUrl: './page-profile.scss'
})
export class PageProfile implements OnInit {
  user: User | null = null;
  savedPasswords: SavedPassword[] = [];
  loading = true;
  displayDeleteDialog = false;
  passwordToDeleteId: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.loadPasswords();
      }
    });
  }

  loadPasswords() {
    this.loading = true;
    this.authService.getPasswords().subscribe({
      next: (response) => {
        if (response.success) {
          this.savedPasswords = response.passwords.map((p: any) => ({...p, visible: false}));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(password: SavedPassword) {
    password.visible = !password.visible;
  }

  deletePassword(id: number) {
    this.passwordToDeleteId = id;
    this.displayDeleteDialog = true;
  }

  confirmDeletePassword() {
    if (this.passwordToDeleteId) {
      this.authService.deletePassword(this.passwordToDeleteId).subscribe({
        next: (response) => {
          if (response.success) {
            this.savedPasswords = this.savedPasswords.filter(p => p.id !== this.passwordToDeleteId);
            this.displayDeleteDialog = false;
            this.passwordToDeleteId = null;
          }
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
