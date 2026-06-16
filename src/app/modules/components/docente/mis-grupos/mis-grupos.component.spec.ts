import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisGruposComponent } from './mis-grupos.component';

describe('MisGruposComponent', () => {
  let component: MisGruposComponent;
  let fixture: ComponentFixture<MisGruposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisGruposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
