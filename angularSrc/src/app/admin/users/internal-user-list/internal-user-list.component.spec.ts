import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalUserListComponent } from './internal-user-list.component';

describe('InternalUserListComponent', () => {
  let component: InternalUserListComponent;
  let fixture: ComponentFixture<InternalUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
