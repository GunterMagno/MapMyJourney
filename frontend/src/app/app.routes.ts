import { Routes } from '@angular/router';
import { StyleGuideComponent } from './components/pages/style-guide/style-guide';
import { DemoPageComponent } from './components/pages/demo-page/demo-page';
import { LoginFormComponent } from './components/auth/login-form/login-form';
import { SignupFormComponent } from './components/auth/signup-form/signup-form';
import { TripsPageComponent } from './components/pages/trips-page/trips-page';
import { NotFoundComponent } from './components/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'demo',
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: DemoPageComponent,
  },
  {
    path: 'auth/login',
    component: LoginFormComponent,
  },
  {
    path: 'auth/signup',
    component: SignupFormComponent,
  },
  {
    path: 'trips',
    component: TripsPageComponent,
  },
  {
    path: 'style-guide',
    component: StyleGuideComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];
