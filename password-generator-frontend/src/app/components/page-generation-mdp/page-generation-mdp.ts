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
  generatedPassword: string = '';

  constructor() {
    this.generatePassword();
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < this.lengthMdp; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedPassword = password;
  }

  onSliderChange(): void {
    this.generatePassword();
  }
}
