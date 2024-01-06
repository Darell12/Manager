import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';

import { DbService } from '../../services/db.service';
import { CourseStatusPipe } from '../../pipes/course-status-pipe';
import { TruncatePipe } from '../../pipes/truncate-pipe';

import JSZip from 'jszip';

@Component({
  selector: 'app-buscador',
  standalone: true,
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css',
  imports: [
    CourseStatusPipe,
    ReactiveFormsModule,
    CommonModule,
    NgClass,
    TruncatePipe,
  ],
})
export class BuscadorComponent implements OnInit {
  loading: boolean = true;
  data: any = [];
  resultados: any = [];
  inputValue: string = '';

  searchrResource = new FormControl('', {
    nonNullable: true,
  });

  constructor(private dbservices: DbService) {}

  ngOnInit(): void {
    console.log('render');
  }

  currentClasses: string = 'badge';

  setCurrentClasses(value: number | string) {
    // CSS classes: added/removed per current state of component properties
    let badge_success = 'badge badge-outline-success';
    let badge_primary = 'badge badge-outline-primary';
    let badge_warning = 'badge badge-outline-warning';
    let badge_error = 'badge badge-outline-error';
    let badge_secondary = 'badge badge-outline-secondary';

    switch (value) {
      case 1:
        return (this.currentClasses = badge_success);
      case 2:
        return (this.currentClasses = badge_primary);
      case 3:
        return (this.currentClasses = badge_warning);
      case 4:
        return (this.currentClasses = badge_error);
      case 5:
        return (this.currentClasses = badge_secondary);
      default:
        return this.currentClasses;
    }
  }

  buscar_recurso(value: string) {
    console.log('click');
    this.loading = true;
    this.dbservices.obtenerRegistros(value).subscribe(
      (result: any) => {
        this.resultados = result;
        this.loading = false;
        console.log(result);
      },
      (error: any) => {
        console.log('Error Obteniendo datos:', error);
        this.loading = false;
      }
    );
  }

  //  TODO: LECTOR DE OVAS
  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.readFileContent(file);
  }

  readFileContent(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      //@ts-ignore
      const arrayBuffer = e.target.result as ArrayBuffer;
      this.processZipContent(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  }

  async processZipContent(zipContent: ArrayBuffer): Promise<void> {
    const zip = new JSZip();
    const zipObject = await zip.loadAsync(zipContent);

    // Aquí puedes procesar las entradas del ZIP, como leer el archivo HTML
    zipObject.forEach(async (relativePath, zipEntry) => {
      if (zipEntry.name.endsWith('.html')) {
        const htmlContent = await zipEntry.async('text');
        this.extractTitleFromHtml(htmlContent);
      }
    });
  }

  extractTitleFromHtml(htmlContent: string): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const titleElement = doc.head.querySelector('title');
    const title = titleElement ? titleElement.textContent : 'No title found';
    console.log('Title:', title);

    if (title != 'No title found') {
      //@ts-ignore
      const formattedTitle = title.replace(/\s+/g, '_');
      this.dbservices.obtenerRegistros(formattedTitle).subscribe(
        (result: any) => {
          console.log(result);
          if (result != null) {
            this.resultados = result;
            this.loading = false;
          }
        },
        (error) => {
          console.log(error);
        }
      );

      const formattedTitleWithOrg = formattedTitle + '_ORG';

      setTimeout(() => {
        this.dbservices.obtenerRegistros(formattedTitleWithOrg).subscribe(
          (result: any) => {
            console.log(result);
            if (result != null) {
              if (this.resultados.length === 0) {
                this.resultados = result;
              } else {
                this.resultados.push(...result);
              }
              this.loading = false;
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }, 1000);
    }
  }
}
