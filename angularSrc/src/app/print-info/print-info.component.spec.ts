import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInfoComponent } from './print-info.component';

describe('PrintInfoComponent', () => {
  let component: PrintInfoComponent;
  let fixture: ComponentFixture<PrintInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
