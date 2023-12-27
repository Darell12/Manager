import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DbService } from '../../services/db.service';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  miDato: string = '';
  contador = signal<number>(0);
  contadorAnterior = signal<number>(
    Number(localStorage.getItem('user_count') || 0)
  );

  diferencia = computed(() => {
    const contadorActual = Number(this.contador());
    const contadorAnterior = Number(this.contadorAnterior());

    let resta = contadorActual - contadorAnterior;

    console.log(resta);
    if (resta == contadorActual) {
      return '';
    }
    return resta;
  });

  constructor(private dbservices: DbService) {}

  intervalId: string | number | NodeJS.Timeout | undefined;

  ngOnInit(): void {
    this.contar_user();

    this.intervalId = setInterval(() => {
      this.contar_user();
      console.log('periodica');
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    console.log('La ejecución periódica ha sido detenida');
  }

  contar_user() {
    let previo = Number(this.diferencia());

    let resta = Number(this.diferencia()) + previo;

    console.log(resta);

    this.dbservices.conteoUsuarios().subscribe(
      (result: any) => {
        const sumaTotal = result.reduce(
          (total: number, dato: { count: string }) =>
            total + parseInt(dato.count, 10),
          0
        );
        this.contadorAnterior.set(this.contador());
        localStorage.setItem('user_count', this.contadorAnterior().toString());
        this.contador.set(sumaTotal.toLocaleString());
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
// await fetch("https://api.mangus.co/api/courses/6037", {
//     "credentials": "include",
//     "headers": {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
//         "Accept": "application/json",
//         "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
//         "Content-Type": "application/json",
//         "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjo0NzMyLCJlbWFpbCI6InNvcG9ydGVAbWFuZ3VzLm9yZyIsIm5hbWUiOiJNYW5ndXMiLCJsYXN0bmFtZSI6IkFjYWRlbXkiLCJwaG9uZSI6Iis1NyAzMDQ2NjY5NDY4IiwiaWRlbnRpZmljYXRpb24iOiIxMjM0NTY3ODkifSwiaWF0IjoxNzAyOTMwMjE2LCJleHAiOjE3MzQ0NjYyMTZ9.3RWQF0ScgzlOBTN3qJXhlamVFYd5erYz69VEpQhiUaE",
//         "Sec-Fetch-Dest": "empty",
//         "Sec-Fetch-Mode": "cors",
//         "Sec-Fetch-Site": "cross-site"
//     },
//     "referrer": "https://mangusacademy.com/",
//     "method": "PUT",
//     "mode": "cors"
// });
