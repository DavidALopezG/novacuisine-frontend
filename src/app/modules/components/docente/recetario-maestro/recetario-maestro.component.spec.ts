import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetarioMaestroComponent } from './recetario-maestro.component';

describe('RecetarioMaestroComponent', () => {
  let component: RecetarioMaestroComponent;
  let fixture: ComponentFixture<RecetarioMaestroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetarioMaestroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetarioMaestroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
