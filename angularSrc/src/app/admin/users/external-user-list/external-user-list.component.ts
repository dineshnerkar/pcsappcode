import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { FilterExternalUser } from '../../constants/filter';
import { ExternalUser } from '../../models/externalUser';
import { UserService } from '../../services/user.service';
import { ExternalUserComponent } from './external-user.component';

@Component({
  selector: 'app-external-user-list',
  templateUrl: './external-user-list.component.html',
  styleUrls: ['./external-user-list.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ExternalUserListComponent implements OnInit {
  public loading: boolean;
  public displayedColumns: string[] = ['firstName', 'lastName', 'userName', 'email', 'actions'];
  public userList: ExternalUser[];
  public mcUserList: any[];
  public filterUserList: Observable<any[]>;
  public filterUser: any = { ...FilterExternalUser };
  constructor(public dialog: MatDialog,
    private userService: UserService,
    private toaster: ToastrService,
    private i18nService: I18nService) {
  }

  ngOnInit() {
    this.getUserList();
    this.getMcUserList();
  }

  public displayName(user: any): string {
    return user ? user.label : '';
  }

  public openExternalUserDialog(externalUserInfo?): void {
    const config: MatDialogConfig = {} as MatDialogConfig;
    if (externalUserInfo) {
      config.data = { user: { ...externalUserInfo }, isUpdate: true };
    } else {
      config.data = { user: undefined, isUpdate: false };
    }
    const externalUserDialogRef: MatDialogRef<ExternalUserComponent> = this.dialog.open(ExternalUserComponent, config);
    externalUserDialogRef.afterClosed().subscribe(result => {
      if (result.status === 'success') {
        this.filterUser = { ...FilterExternalUser };
        this.getUserList();
      }
    });
  }

  public deleteExternalUser(user: ExternalUser): void {
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
        const deleteObserver: PartialObserver<any> = {
          next: (result) => {
            if (result.status === 'success') {
              this.filterUser = { ...FilterExternalUser };
              this.getUserList();
            }
          },
          error: () => {
            this.toaster.error(this.i18nService.translate.instant('external-user-list-component.error.delete'));
          },
          complete: () => {
            this.loading = false;
          }
        };
        this.loading = true;
        this.userService.deleteExternalUser(user).subscribe(deleteObserver);
      }
    });

  }

  public getUserList(): void {
    const listObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.userList = result.payload;
        } else {
          this.userList = [];
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('external-user-list-component.error.getData'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.userService.getExternalUsers(this.filterUser).subscribe(listObserver);
  }

  private getMcUserList(): void {
    const listObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.mcUserList = result.payload;
          this.userService.externalUserList.next(result.payload);
          this.filterUserList = of(result.payload);
        } else {
          this.mcUserList = [];
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('external-user-list-component.error.getData'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.userService.getAllExternalUserList().subscribe(listObserver);
  }

  public clearFilter(): void {
    this.filterUser = { ...FilterExternalUser };
    this.getUserList();
  }

  public filterRecipientsList(): void {
    if (this.mcUserList) {
      this.filterUserList = of(this.mcUserList.filter(mas => {
        if (typeof this.filterUser.name === 'string' && mas.value.toLowerCase().indexOf(this.filterUser.name.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.filterUserList) {
        this.filterUserList = of([]);
      }
    }
  }

}
