import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMappingListComponent } from './profile-mapping-list.component';

describe('ProfileMappingListComponent', () => {
  let component: ProfileMappingListComponent;
  let fixture: ComponentFixture<ProfileMappingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileMappingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMappingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
