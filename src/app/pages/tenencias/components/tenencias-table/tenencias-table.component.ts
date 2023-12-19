import { Component, computed, signal, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, NgClass } from '@angular/common';
import { FilterType, Ssl, dominioModel } from '../../../../models/basic-info';
import { DbService } from '../../../../services/db.service';

@Component({
  selector: 'app-tenencias-table',
  standalone: true,
  imports: [NgClass],
  templateUrl: './tenencias-table.component.html',
  styleUrl: './tenencias-table.component.css',
})
export class TenenciasTableComponent {

  dominios: any[] | undefined;
  dominiosSignal = signal<dominioModel[]>([]);

  filter = signal<FilterType>('all');

  rows: any[] = [];
  rowsSignal = signal<Ssl[]>([]);

  tenencias = computed(() => {
    const filter = this.filter();
    const rows = this.rowsSignal();

    switch (filter) {
      case 'active':
        console.log(rows);
        return rows.filter((row) => row.result.cert_valid);
      case 'expired':
        console.log(rows);
        return rows.filter((row) => !row.result.cert_valid);
      default:
        return rows;
    }
  });
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
        this.dominiosSignal().map((dominio, index) => {
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
    this.current_tenancy = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
}
