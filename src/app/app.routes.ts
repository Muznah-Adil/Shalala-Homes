import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Shalala Homes' },
  // Presentable section URLs — all render the home page, scrolled to the section
  { path: 'services', component: Home, title: 'Management Services' },
  { path: 'about', component: Home, title: 'About Us' },
  { path: 'for-owners', component: Home, title: 'For Property Owners' },
  { path: 'contact', component: Home, title: 'Contact' },
  {
    path: 'rentals',
    loadComponent: () => import('./components/rentals/rentals').then(m => m.Rentals),
    title: 'Rentals',
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-login/admin-login').then(m => m.AdminLogin),
    title: 'Admin',
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard],
    title: 'Manage Rentals',
  },
  { path: '**', redirectTo: '' },
];
