import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { ProfileDocumentFilter } from '../../constants/filter';
import { Profile, ProfileDocument, ProfileDocumentMapping } from '../../models/profile';
import { ProfileService } from '../../services/profile.service';
import { ProfileMappingComponent } from '../profile-mapping-list/profile-mapping.component';
@Component({
  selector: 'app-profile-mapping-list',
  templateUrl: './profile-mapping-list.component.html',
  styleUrls: ['./profile-mapping-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileMappingListComponent implements OnInit {
  public loading: boolean;
  public displayedColumns: string[] = ['profileName', 'documentNames', 'actions'];
  public profileDocumentFilter: any = { ...ProfileDocumentFilter };
  public profileDocumentList: ProfileDocumentMapping[];
  public profileList: Profile[];
  public documentList: ProfileDocument[];
  public profileOptions: Observable<Profile[]>;
  public documentFilterList: Observable<ProfileDocument[]>;
  constructor(private dialog: MatDialog,
    private profileService: ProfileService,
    private toaster: ToastrService,
    private i18nService: I18nService) {
  }

  ngOnInit() {
    this.getProfileDocumentList();
    this.getDocumentList();
    this.getProfileList();
  }

  public getProfileDocumentList(): void {
    const profileDocumentListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.profileDocumentList = result.payload;
        } else {
          this.profileDocumentList = [];
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('profile-mapping-list-component.error.getData'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getProfileDocumentList(this.profileDocumentFilter).subscribe(profileDocumentListObserver);
  }

  public getDocumentList(): void {
    const documentListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.documentList = result.payload;
          this.profileService.documentList.next(result.payload);
          this.documentFilterList = of(result.payload);
        } else {
          this.documentList = [];
          this.documentFilterList = of([]);
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('profile-mapping-list-component.error.getData'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getDocumentList({}).subscribe(documentListObserver);
  }

  public getProfileList(): void {
    const profileListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.profileList = result.payload;
          this.profileService.profileList.next(result.payload);
          this.profileOptions = of(result.payload);
        } else {
          this.profileList = [];
          this.profileOptions = of([]);
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('profile-mapping-list-component.error.getData'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getProfileList({}).subscribe(profileListObserver);
  }

  public openProfileMappingDialog(profile?): void {
    const config: MatDialogConfig = {
      width: '1000px',
    }
    if (profile) {
      profile.profile = {
        _id: profile.profileId,
        name: profile.profileName
      };
      config.data = { ... { isUpdate: true, profileDocumentMapping: { ...profile } } };
    } else {
      config.data = { ... { isUpdate: false, profileDocumentMapping: {} as Profile } };
    }
    const profileMappingDialogRef: MatDialogRef<ProfileMappingComponent> = this.dialog.open(ProfileMappingComponent, config);
    profileMappingDialogRef.afterClosed().subscribe(result => {
      if (result.status === 'success') {
        this.profileDocumentFilter = { ...ProfileDocumentFilter };
        this.documentFilterList = of(this.documentList);
        this.getProfileList();
        this.getProfileDocumentList();
      }
    });
  }

  public deleteProfileMapping(profileDocumentMapping: ProfileDocumentMapping) {
    const dialogRef: MatDialogRef<DialogComponent> = this.dialog.open(DialogComponent, {
      data: {
        message: this.i18nService.translate.instant('admin.dialog-component.Are-you-sure-want-to-delete'),
        buttonText: {
          ok: this.i18nService.translate.instant('admin.dialog-component.Delete'),
          cancel: this.i18nService.translate.instant('admin.dialog-component.No')
        }
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        const documentListObserver: PartialObserver<any> = {
          next: (result) => {
            this.profileDocumentFilter = { ...ProfileDocumentFilter };
            this.documentFilterList = of(this.documentList);
            this.profileOptions = of(this.profileList);
            this.getProfileDocumentList();
            this.toaster.success(this.i18nService.translate.instant('profile-mapping-list-component.deleteSuccess'));
          },
          error: () => {
            this.toaster.error(this.i18nService.translate.instant('profile-mapping-list-component.error.delete'));
          },
          complete: () => {
            this.loading = false;
          }
        };
        this.loading = true;
        this.profileService.deleteProfileMapping(profileDocumentMapping).subscribe(documentListObserver);

      }
    });

  }

  public displayName(profile: Profile | null): string {
    if (profile === null) {
      return '';
    } else {
      return profile.name;
    }
  }

  public clearFilter(): void {
    this.profileDocumentFilter = { ...ProfileDocumentFilter };
    this.documentFilterList = of(this.documentList);
    this.profileOptions = of(this.profileList);
    this.getProfileDocumentList();
  }

  public filterProfileName(): void {
    if (this.profileList) {
      this.profileOptions = of(this.profileList.filter(mas => {
        if (typeof this.profileDocumentFilter.profileName === 'string' && mas.name.toLowerCase().indexOf(this.profileDocumentFilter.profileName.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.profileOptions) {
        this.profileOptions = of([]);
      }
    }
  }

  public filterDocumentName(): void {
    if (this.documentList) {
      this.documentFilterList = of(this.documentList.filter(mas => {
        if (typeof this.profileDocumentFilter.documentName === 'string' && mas.name.toLowerCase().indexOf(this.profileDocumentFilter.documentName.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.documentFilterList) {
        this.documentFilterList = of([]);
      }
    }
  }

}
