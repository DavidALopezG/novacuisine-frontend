import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaEstudianteComponent } from './estado-cuenta-estudiante.component';

describe('EstadoCuentaEstudianteComponent', () => {
  let component: EstadoCuentaEstudianteComponent;
  let fixture: ComponentFixture<EstadoCuentaEstudianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaEstudianteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoCuentaEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
