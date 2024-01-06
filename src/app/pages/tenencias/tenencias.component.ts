import { Component, OnInit, computed, signal } from '@angular/core';
import { DbService } from '../../services/db.service';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { CommonModule, NgClass } from '@angular/common';
import {
  FilterType,
  Ssl,
  dominioModel,
} from '../../models/basic-info';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TenenciasTableComponent } from './components/tenencias-table/tenencias-table.component';

@Component({
  selector: 'app-tenencias',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    CommonModule,
    TenenciasTableComponent,
  ],
  templateUrl: './tenencias.component.html',
  styleUrl: './tenencias.component.css',
})
export class TenenciasComponent implements OnInit {
  dominios: any[] | undefined;
  dominiosSignal = signal<dominioModel[]>([]);

  filter = signal<FilterType>('all');

  rows: any[] = [];
  rowsSignal = signal<Ssl[]>([]);

  searchTenencia = new FormControl('', {
    nonNullable: true,
  });

  searchQuery = signal<string>('');
  onSearchUpdated(sq: string) {
    this.searchQuery.set(sq);
  }

  tenencias = computed(() => {
    const filter = this.filter();
    const rows = this.rowsSignal();
    const sq = this.searchQuery();

    console.log(sq);

    switch (filter) {
      case 'active':
        console.log(rows);
        return rows.filter((row) => row.result.cert_valid);
      case 'expired':
        console.log(rows);
        return rows.filter((row) => !row.result.cert_valid);
      default:
        return sq === '' ? rows : rows.filter((row) => row.host.includes(sq));
    }
  });

  search() {
    const search = this.searchTenencia.value.trim();
    return this.rowsSignal.update((prev_tenencia) => {
      return prev_tenencia.filter((row) => row.host != search);
    });
  }

  current_tenancy: SafeResourceUrl = '';

  filtro: string = '';

  iframeWidth = '50vw';
  iframeHeight = '70vh';

  constructor(private dbservices: DbService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    console.log('render');
    this.obtenerDatos();
  }

  obtenerDatos() {
    this.dbservices.obtenerDominios().subscribe(
      (result: dominioModel[]) => {
        console.log(result);
        this.dominios = result;
        this.dominiosSignal.set(result);
        // Validamos cada dominio
        //@ts-ignore
        this.dominiosSignal().map((dominio) => {
          this.dbservices.verificarSsl(dominio.url).subscribe(
            (result: any) => {
              const existingRow = this.rows.find(
                (row) => row.url === dominio.url
              );
              if (existingRow) {
                Object.assign(existingRow, result);
              } else {
                this.rows.push(result);
                this.rowsSignal().push(result);
              }
            },
            (errorAdicional: any) => {
              console.log('Error en el servicio adicional:', errorAdicional);
            }
          );
        });
      },
      (error: any) => {
        console.log('Error obteniendo datos:', error);
      }
    );
  }

  previsualizarTenancy(url: string) {
    this.current_tenancy = this.sanitizer.bypassSecurityTrustUrl(url);
  }

  refrescarFila(url: string) {
    // Buscamos la fila en base a la URL y la refrescamos
    console.log('refresh');
    console.log(this.rows);
    const fila = this.rows.find((row) => row.host == url);
    console.log(fila);
    if (fila) {
      this.dbservices.verificarSsl(url).subscribe(
        (result: any) => {
          Object.assign(fila, result);
          console.log('refresh');
          console.log('refresh');
        },
        (error: any) => {
          console.log('Error al refrescar fila:', error);
        }
      );
    }
  }

  filtrarDatos(): any[] {
    return this.rows.filter(
      (item) =>
        item.result.host.toLowerCase().includes(this.filtro.toLowerCase()) ||
        item.result.cert_valid.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
