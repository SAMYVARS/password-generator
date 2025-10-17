import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/page-generation-mdp/page-generation-mdp').then(m => m.PageGenerationMdp) }
];
