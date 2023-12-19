import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}
  obtenerRegistros(valor_a_buscar: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recurso/${valor_a_buscar}`);
  }

  obtenerDominios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dominios`);
  }

  verificarSsl(dominio: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/checkssl/${dominio}`);
  }

  obtenerUsuarios(currentPage: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/users?page=${currentPage}&pageSize=${pageSize}`
    );
  }

  conteoUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/contar`
    );
  }
}
