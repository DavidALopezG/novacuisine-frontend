import { TestBed } from '@angular/core/testing';

import { TitulacionesService } from './titulaciones.service';

describe('TitulacionesService', () => {
  let service: TitulacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitulacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
