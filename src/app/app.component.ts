import { Component, ViewChild, computed, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from './core/services';
import { RouterLink } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'angular-17';
  sidebarState = signal<boolean>(false);
  // version = signal();
  version: string = 'Cargando...';

  css = computed(() => {
    const sidebarState = this.sidebarState();

    switch (sidebarState) {
      case true:
        return 'fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-[#1c1c1c] dark:border-[#1c1c1c] transform-none';
      case false:
        return 'fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-[#1c1c1c] dark:border-[#1c1c1c]';
      default:
        return 'fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-[#1c1c1c] dark:border-[#1c1c1c]';
    }
  });

  constructor(private electronService: ElectronService) {
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
      //@ts-ignore
      // this.version = this.electronService.getVersion();
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit() {
    // Llama al método getVersion para obtener la versión
    // this.version.set(this.electronService.getVersion());
  }

  tooglenav() {
    console.log('evento');
    return this.sidebarState.set(!this.sidebarState());
  }
}
