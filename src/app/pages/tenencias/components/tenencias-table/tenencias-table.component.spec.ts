import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenenciasTableComponent } from './tenencias-table.component';

describe('TenenciasTableComponent', () => {
  let component: TenenciasTableComponent;
  let fixture: ComponentFixture<TenenciasTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenenciasTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenenciasTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
