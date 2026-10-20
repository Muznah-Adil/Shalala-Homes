import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalDetail } from './rental-detail';

describe('RentalDetail', () => {
  let component: RentalDetail;
  let fixture: ComponentFixture<RentalDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
