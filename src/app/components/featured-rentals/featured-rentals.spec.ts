import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedRentals } from './featured-rentals';

describe('FeaturedRentals', () => {
  let component: FeaturedRentals;
  let fixture: ComponentFixture<FeaturedRentals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedRentals],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedRentals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
