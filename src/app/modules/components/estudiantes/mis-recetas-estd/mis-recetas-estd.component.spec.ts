import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisRecetasEstdComponent } from './mis-recetas-estd.component';

describe('MisRecetasEstdComponent', () => {
  let component: MisRecetasEstdComponent;
  let fixture: ComponentFixture<MisRecetasEstdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisRecetasEstdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisRecetasEstdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
