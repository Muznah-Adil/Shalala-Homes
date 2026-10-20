import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Owners } from './owners';

describe('Owners', () => {
  let component: Owners;
  let fixture: ComponentFixture<Owners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Owners],
    }).compileComponents();

    fixture = TestBed.createComponent(Owners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
