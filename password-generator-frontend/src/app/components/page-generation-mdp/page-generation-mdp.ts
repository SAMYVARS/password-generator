import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-page-generation-mdp',
  imports: [ButtonModule, Checkbox, SliderModule, FormsModule, MatIconModule, CommonModule, InputTextModule],
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

  generationMode: 'random' | 'ai' = 'random';
  userPrompt: string = '';
  isGeneratingAi: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.generatePassword();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion', err);
      }
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

  onSliderChange(event?: any): void {
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
    if (this.liked) {
      console.log(`Suppression du mot de passe ${this.generatedPassword} de la base`);
      // logique pour supprimer de la DB
      this.liked = false;
    } else {
      console.log(`Sauvegarde du mot de passe ${this.generatedPassword} dans la base`);
      // logique pour ajouter dans la DB
      this.liked = true;
    }
  }
}
