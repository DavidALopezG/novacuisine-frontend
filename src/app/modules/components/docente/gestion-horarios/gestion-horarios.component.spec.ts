import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionHorariosComponent } from './gestion-horarios.component';

describe('GestionHorariosComponent', () => {
  let component: GestionHorariosComponent;
  let fixture: ComponentFixture<GestionHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
