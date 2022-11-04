import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDashboardComponent } from './print-dashboard.component';

describe('PrintDashboardComponent', () => {
  let component: PrintDashboardComponent;
  let fixture: ComponentFixture<PrintDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
