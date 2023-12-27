import { Component, OnInit, signal } from '@angular/core';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-user-count-detail',
  standalone: true,
  imports: [],
  templateUrl: './user-count-detail.component.html',
  styleUrl: './user-count-detail.component.css',
})
export class UserCountDetailComponent implements OnInit {
  info = signal<any[]>([]);

  constructor(private dbservices: DbService) {}

  ngOnInit(): void {
    this.obtenerInformacion();
  }

  obtenerInformacion() {
    this.dbservices.conteoUsuarios().subscribe(
      (result: any[]) => {
        console.log(result);
        this.info.set(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
