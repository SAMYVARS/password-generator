import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';

@Component({
  selector: 'app-page-generation-mdp',
  imports: [ButtonModule, Checkbox],
  templateUrl: './page-generation-mdp.html',
  standalone: true,
  styleUrl: './page-generation-mdp.scss'
})
export class PageGenerationMdp {
}
