import { Component, OnInit, signal } from '@angular/core';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  currentPage = 1;
  pageSize = 10;

  users = signal<any[]>([]);

  constructor(private dbservices: DbService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.dbservices.obtenerUsuarios(this.currentPage, this.pageSize).subscribe(
      (result: any[]) => {
        this.users.set(result);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  loadNextPage() {
    this.currentPage++;
    this.loadUsers();
  }
}
