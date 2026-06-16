import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEstdComponent } from './perfil-estd.component';

describe('PerfilEstdComponent', () => {
  let component: PerfilEstdComponent;
  let fixture: ComponentFixture<PerfilEstdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEstdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilEstdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
