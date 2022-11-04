import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { ExternalUser } from '../../models/externalUser';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-external-user',
  templateUrl: './external-user.component.html',
  styleUrls: ['./external-user-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ExternalUserComponent implements OnInit {

  public filterUserList: Observable<any[]>;
  public externalUserMaster: any[];
  public isUpdate: boolean;
  public user: any;
  public loading: boolean;
  public error: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ExternalUserComponent>,
    private toastr: ToastrService,
    private userService: UserService,
    private i18nService: I18nService) {
    this.userService.externalUserList.subscribe(result => {
      if (result && result.length > 0) {
        this.externalUserMaster = result;
        this.filterUserList = of(result);
      }
    });
  }

  ngOnInit() {
    if (this.data) {
      this.isUpdate = this.data.isUpdate;
      if (this.data.user) {
        this.user = this.data.user;
      } else {
        this.user = {} as ExternalUser;
      }
    }
  }

  public displayName(user: any): string {
    return user && user.label ? user.label : '';
  }

  public filterRecipientsList(): void {
    if (this.externalUserMaster) {
      this.filterUserList = of(this.externalUserMaster.filter(mas => {
        if (typeof this.user === 'string' && mas.value.toLowerCase().indexOf(this.user.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.filterUserList) {
        this.filterUserList = of([]);
      }
    }
  }

  public addExternalUser(): void {
    if (typeof this.user === 'string' || this.user.userName === "") {
      this.error.userName = "required";
    } else {
      const getRecipientObserver: PartialObserver<any> = {
        next: (result: any) => {
          if (result.status === 'success') {
            this.toastr.success(this.i18nService.translate.instant('admin.internalUser.User-Added-Successfully'), '');
            this.dialogRef.close({ "status": "success" });
          } else {
            this.dialogRef.close({ "status": "error" });
            this.toastr.error(this.i18nService.translate.instant('admin.internalUser.User-Name-Exists'));
          }
        },
        error: () => {
          this.dialogRef.close({ "status": "error" });
          this.toastr.error(this.i18nService.translate.instant('internal-user-list-component.Error-in-adding-Internal-User'));
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.userService.addExternalUser(this.user).subscribe(getRecipientObserver);
    }
  }

}
