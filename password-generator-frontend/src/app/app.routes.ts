import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/page-generation-mdp/page-generation-mdp').then(m => m.PageGenerationMdp) },
  { path: 'login', loadComponent: () => import('./components/page-login/page-login').then(m => m.PageLogin) },
  { path: 'register', loadComponent: () => import('./components/page-register/page-register').then(m => m.PageRegister) },
  { path: 'profile', loadComponent: () => import('./components/page-profile/page-profile').then(m => m.PageProfile) }
];
