import {Component, OnInit, computed, signal} from '@angular/core';
import {DbService} from '../../services/db.service';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {CommonModule, NgClass} from '@angular/common';
import {
  FilterType,
  ISsl,
  IDomain,
} from '../../core/interfaces/domain.interface';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TenenciasTableComponent} from './components/tenencias-table/tenencias-table.component';

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
  current_tenancy: SafeResourceUrl = '';
  iframeWidth = '50vw';
  iframeHeight = '70vh';

  dominiosSignal = signal<IDomain[]>([]);
  filter = signal<FilterType>('all');
  rowsSignal = signal<ISsl[]>([]);
  searchQuery = signal<string>('');

  onSearchUpdated(sq: string) {
    this.searchQuery.set(sq);
  }

  searchTenencia = new FormControl('', {
    nonNullable: true,
  });

  rows: any[] = [];

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

  constructor(private dbservices: DbService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    console.log('render');
    this.obtenerDatos();
  }

  obtenerDatos() {
    this.dbservices.obtenerDominios().subscribe(
      (result: IDomain[]) => {
        this.dominiosSignal.set(result);

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
    console.log('refresh');
    console.log(this.rows);
    const fila = this.rows.find((row) => row.host == url);
    console.log(fila);
    if (fila) {
      this.dbservices.verificarSsl(url).subscribe(
        (result: any) => {
          Object.assign(fila, result);
        },
        (error: any) => {
          console.log('Error al refrescar fila:', error);
        }
      );
    }
  }
}
