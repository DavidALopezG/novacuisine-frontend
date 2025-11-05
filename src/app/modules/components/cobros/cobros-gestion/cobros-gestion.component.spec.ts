import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobrosGestionComponent } from './cobros-gestion.component';

describe('CobrosGestionComponent', () => {
  let component: CobrosGestionComponent;
  let fixture: ComponentFixture<CobrosGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CobrosGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CobrosGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
