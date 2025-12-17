import { Routes } from '@angular/router';
 import { StyleGuideComponent } from './components/pages/style-guide/style-guide';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'style-guide',
    pathMatch: 'full'
  },
  {
    path: 'style-guide',
    component: StyleGuideComponent,
  },
];
