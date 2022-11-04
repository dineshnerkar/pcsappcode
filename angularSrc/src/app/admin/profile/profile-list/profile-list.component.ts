import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { ProfileFilter } from '../../constants/filter';
import { Profile } from '../../models/profile';
import { ProfileService } from '../../services/profile.service';
@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileListComponent implements OnInit {
  public loading: boolean;
  public displayedColumns: string[] = ['name', 'applicable_for', 'used_in', 'actions'];
  public profileList: Profile[];
  public filteredProfileOptions: Observable<Profile[]>;
  public profileFilter: any = { ...ProfileFilter };

  constructor(public dialog: MatDialog,
    private profileService: ProfileService,
    private router: Router,
    private toast: ToastrService,
    private i18nService: I18nService) {
    this.filteredProfileOptions = of([]);
  }

  ngOnInit() {
    this.getProfileList();
  }

  public getProfileList(): void {
    const profileListObservable: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.profileList = result.payload;
          this.filteredProfileOptions = of(result.payload);
        } else {
          this.profileList = [];
          this.filteredProfileOptions = of([]);
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('profile-list-component.error.getError'));
        this.profileList = [];
        this.filteredProfileOptions = of([]);
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getProfileList(this.profileFilter).subscribe(profileListObservable);
  }

  public clearFilter(): void {
    this.profileFilter = { ...ProfileFilter };
    this.getProfileList();
  }

  public deleteProfile(row: Profile): void {
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
        const deleteObservable: PartialObserver<any> = {
          next: (result) => {
            if (result.status === 'success') {
              this.toast.error('profile-list-component.deleteSuccess');
              this.profileFilter = { ...ProfileFilter };
              this.getProfileList();
            } else {
              this.toast.error('profile-list-component.error.delete');
            }
          },
          error: () => {
            this.toast.error('profile-list-component.error.delete');
          },
          complete: () => {
            this.loading = false;
          }
        };
        this.loading = true;
        this.profileService.deleteProfile(row).subscribe(deleteObservable);
      }
    });
  }

  public updateProfile(row: Profile): void {
    this.router.navigate(['admin/profile'], { queryParams: { id: row._id } });
  }

  public addProfile(): void {
    this.router.navigate(['admin/profile'], { queryParams: { id: null } });
  }

  public filterProfileName(): void {
    if (this.profileFilter) {
      this.filteredProfileOptions = of(this.profileList.filter(profile => {
        if (profile.name.toLocaleLowerCase().includes(this.profileFilter.name.toLocaleLowerCase())) {
          return profile;
        }
      }));
    } else {
      this.filteredProfileOptions = of(this.profileList);
    }
  }

}
