import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'courseStatus',
  standalone: true,
})
export class CourseStatusPipe implements PipeTransform {
  transform(courseStatusId: number): string {
    // Aquí puedes mapear los IDs a los nombres correspondientes
    switch (courseStatusId) {
      case 1:
        return 'Publicado';
      case 2:
        return 'En Edición';
      case 3:
        return 'Revisión';
      case 4:
        return 'Eliminado';
      case 5:
        return 'Necesita correcciones';
      default:
        return 'Desconocido';
    }
  }
}
