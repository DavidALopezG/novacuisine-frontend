import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioClaseComponent } from './horario-clase.component';

describe('HorarioClaseComponent', () => {
  let component: HorarioClaseComponent;
  let fixture: ComponentFixture<HorarioClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarioClaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
