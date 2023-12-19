import { Component, OnInit } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Observable } from 'rxjs';
import { CourseStatusPipe } from "../../pipes/course-status-pipe";

@Component({
    selector: 'app-buscador',
    standalone: true,
    templateUrl: './buscador.component.html',
    styleUrl: './buscador.component.css',
    imports: [CourseStatusPipe]
})
export class BuscadorComponent implements OnInit {
  loading: boolean = true;
  data: any = [];
  resultados: any = [];
  inputValue: string = '';
  constructor(private dbservices: DbService) {}

  ngOnInit(): void {
    console.log('render');
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
}