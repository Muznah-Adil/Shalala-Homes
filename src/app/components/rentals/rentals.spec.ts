import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rentals } from './rentals';

describe('Rentals', () => {
  let component: Rentals;
  let fixture: ComponentFixture<Rentals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rentals],
    }).compileComponents();

    fixture = TestBed.createComponent(Rentals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
