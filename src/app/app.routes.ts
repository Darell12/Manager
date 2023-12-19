import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BuscadorComponent } from './pages/buscador/buscador.component';
import { TenenciasComponent } from './pages/tenencias/tenencias.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'buscador',
    component: BuscadorComponent,
  },
  {
    path: 'tenencias',
    component: TenenciasComponent,
  },
  {
    path: 'users',
    component: UsersComponent,
  },
];
