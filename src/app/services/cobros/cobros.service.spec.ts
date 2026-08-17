import { TestBed } from '@angular/core/testing';

import { CobrosService } from './cobros.service';

describe('CobrosService', () => {
  let service: CobrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CobrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
