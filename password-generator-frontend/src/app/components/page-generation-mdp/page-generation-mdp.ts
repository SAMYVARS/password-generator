import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-page-generation-mdp',
  imports: [CommonModule, ButtonModule, Checkbox, SliderModule, FormsModule, MatIconModule, DialogModule, InputTextModule],
  templateUrl: './page-generation-mdp.html',
  standalone: true,
  styleUrl: './page-generation-mdp.scss'
})
export class PageGenerationMdp {
  currentUser: User | null = null;
  lengthMdp: number = 16;
  // Keep previous slider value to avoid regenerating when value didn't change
  lastLength: number = 16;
  generatedPassword: string = '';
  includeLetters: boolean = true;
  includeNumbers: boolean = true;
  includeSymbols: boolean = true;
  includeSimilar: boolean = true;
  passwordAnimating: boolean = false;
  liked: boolean = false;
  pwnedInfo: any = null;
  savedPasswordId: number | null = null;
  displaySaveDialog: boolean = false;
  displayDeleteDialog: boolean = false;
  serviceName: string = '';

  generationMode: 'random' | 'ai' = 'random';
  userPrompt: string = '';
  isGeneratingAi: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.generatePassword();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }


  generatePassword(): void {
    if (this.generationMode === 'ai') {
      if (this.userPrompt.trim()) {
        this.generateAiPassword();
      }
      return;
    }

    let chars = '';

    if (this.includeLetters) {
      chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }

    if (this.includeNumbers) {
      chars += '0123456789';
    }

    if (this.includeSymbols) {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (this.includeSimilar) {
      chars += '0O1l|2Z';
    }

    // Si chars est vide alors retournée aucun mot de passe
    if (chars === '') {
      this.generatedPassword = '';
      this.pwnedInfo = null;
      return;
    }

    let password = '';
    for (let i = 0; i < this.lengthMdp; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedPassword = password;

    // Déclencher l'animation
    this.triggerPasswordAnimation();
    this.checkPasswordLeak();
  }

  generateAiPassword(): void {
    if (!this.userPrompt.trim()) return;

    this.isGeneratingAi = true;
    this.http.post('http://127.0.0.1:5000/api/generate-ai-password', { prompt: this.userPrompt })
      .subscribe({
        next: (response: any) => {
          console.log('Mot de passe généré par IA :', response.password);
          this.generatedPassword = response.password;
          this.triggerPasswordAnimation();
          this.checkPasswordLeak();
          this.isGeneratingAi = false;
          this.cdr.detectChanges(); // Force update
        },
        error: (error) => {
          console.error('Erreur lors de la génération du mot de passe par IA', error);
          this.isGeneratingAi = false;
          this.cdr.detectChanges();
        }
      });
  }

  checkPasswordLeak(): void {
    if (!this.generatedPassword) return;

    this.http.post('http://127.0.0.1:5000/api/check-password', { password: this.generatedPassword })
      .subscribe({
        next: (response: any) => {
          this.pwnedInfo = response;
        },
        error: (error) => {
          console.error('Erreur lors de la vérification des fuites de mot de passe', error);
          this.pwnedInfo = null;
        }
      });
  }

  triggerPasswordAnimation(): void {
    this.passwordAnimating = true;
    setTimeout(() => {
      this.passwordAnimating = false;
    }, 500);
  }

  onSliderChange(): void {
    // si la valeur n'a pas changé, ne rien faire
    if (this.lengthMdp === this.lastLength) {
      return;
    }

    this.lastLength = this.lengthMdp;
    this.generatePassword();
  }

  // Si rien n'est coché, empêcher le décochage de la dernière checkbox
  onCheckboxChange(option: 'letters' | 'numbers' | 'symbols' | 'similar'): void {
    // Vérifier si au moins une option est cochée
    const hasAtLeastOne = this.includeLetters || this.includeNumbers || this.includeSymbols || this.includeSimilar;

    // Si aucune option n'est cochée, recocher celle qu'on vient de décocher
    if (!hasAtLeastOne) {
      switch (option) {
        case 'letters':
          this.includeLetters = true;
          break;
        case 'numbers':
          this.includeNumbers = true;
          break;
        case 'symbols':
          this.includeSymbols = true;
          break;
        case 'similar':
          this.includeSimilar = true;
          break;
      }
    }

    // Génère le mot de passe après avoir modifié les options
    this.generatePassword();
  }

  copyPassword(): void {
    if (this.generatedPassword) {
      navigator.clipboard.writeText(this.generatedPassword);
    }
  }

  getSliderPosition(): number {
    const min = 4;
    const max = 40;
    return ((this.lengthMdp - min) / (max - min)) * 100;
  }

  // Vérifie si une checkbox doit être désactivée (si c'est la seule cochée)
  isCheckboxDisabled(option: 'letters' | 'numbers' | 'symbols' | 'similar'): boolean {
    const checkedCount = [this.includeLetters, this.includeNumbers, this.includeSymbols, this.includeSimilar]
      .filter(checked => checked).length;

    // Si une seule checkbox est cochée et que c'est celle-ci, la désactiver
    if (checkedCount === 1) {
      switch (option) {
        case 'letters':
          return this.includeLetters;
        case 'numbers':
          return this.includeNumbers;
        case 'symbols':
          return this.includeSymbols;
        case 'similar':
          return this.includeSimilar;
      }
    }
    return false;
  }
  savePassword(): void {
    if (!this.currentUser) {
      alert('Veuillez vous connecter pour sauvegarder un mot de passe');
      return;
    }

    if (this.liked && this.savedPasswordId) {
      this.displayDeleteDialog = true;
    } else {
      // Open dialog
      this.serviceName = '';
      this.displaySaveDialog = true;
    }
  }

  confirmSavePassword(): void {
    if (this.serviceName) {
      this.authService.savePassword(this.serviceName, this.generatedPassword).subscribe({
        next: (response) => {
          if (response.success) {
            this.liked = true;
            this.savedPasswordId = response.password.id;
            this.displaySaveDialog = false;
          }
        }
      });
    }
  }

  deleteSavedPassword(): void {
      if (this.savedPasswordId) {
        this.authService.deletePassword(this.savedPasswordId).subscribe({
            next: (response) => {
            if (response.success) {
                this.liked = false;
                this.savedPasswordId = null;
                this.displayDeleteDialog = false;
            }
            }
        });
      }
  }
}
