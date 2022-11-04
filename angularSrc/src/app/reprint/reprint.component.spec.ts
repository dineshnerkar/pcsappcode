import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReprintComponent } from './reprint.component';

describe('ReprintComponent', () => {
  let component: ReprintComponent;
  let fixture: ComponentFixture<ReprintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReprintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
