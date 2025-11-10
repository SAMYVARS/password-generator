import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-page-generation-mdp',
  imports: [ButtonModule, Checkbox, SliderModule, FormsModule],
  templateUrl: './page-generation-mdp.html',
  standalone: true,
  styleUrl: './page-generation-mdp.scss'
})
export class PageGenerationMdp {
  lengthMdp: number = 16;
  // Keep previous slider value to avoid regenerating when value didn't change
  lastLength: number = 16;
  generatedPassword: string = '';
  includeLetters: boolean = true;
  includeNumbers: boolean = true;
  includeSymbols: boolean = true;
  includeSimilar: boolean = true;

  constructor() {
    this.generatePassword();
  }

  generatePassword(): void {
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
      return;
    }

    let password = '';
    for (let i = 0; i < this.lengthMdp; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedPassword = password;
  }

  onSliderChange(event?: any): void {
    // si la valeur n'a pas changé, ne rien faire
    if (this.lengthMdp === this.lastLength) {
      return;
    }

    this.lastLength = this.lengthMdp;
    this.generatePassword();
  }

  // Vérifie s'il reste au moins une option cochée
  hasAtLeastOneOption(): boolean {
    return this.includeLetters || this.includeNumbers || this.includeSymbols || this.includeSimilar;
  }

  // Si rien n'est coché alors `includeLetters` = true (les autres false)
  onCheckboxChange(option: 'letters' | 'numbers' | 'symbols' | 'similar'): void {
    if (!(this.includeLetters || this.includeNumbers || this.includeSymbols || this.includeSimilar)) {
      this.includeLetters = true;
      this.includeNumbers = false;
      this.includeSymbols = false;
      this.includeSimilar = false;
    }

    // Génère le mot de passe après avoir modifié les options
    this.generatePassword();
  }

  copyPassword(): void {
    if (this.generatedPassword) {
      navigator.clipboard.writeText(this.generatedPassword);
    }
  }
}
