import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCountDetailComponent } from './user-count-detail.component';

describe('UserCountDetailComponent', () => {
  let component: UserCountDetailComponent;
  let fixture: ComponentFixture<UserCountDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCountDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserCountDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
