import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, of, PartialObserver } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/admin/services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { I18nService } from 'src/app/service/i18n.service';
import { SelectOption } from 'src/app/admin/models/selectOption';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InternalUserComponent implements OnInit {

  public loading: boolean;
  public recipients: Observable<SelectOption[]>;
  public recipientsMaster: SelectOption[];
  public user: any;
  public roles: any;
  public isUpdate: boolean;
  public error: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<InternalUserComponent>,
    private toastr: ToastrService,
    private userService: UserService,
    private i18nService: I18nService) {
    this.userService.userList.subscribe(result => {
      if (result && result.length > 0) {
        this.recipientsMaster = result;
        this.recipients = of(result);
      }
    });
  }

  ngOnInit() {
    if (this.data) {
      this.isUpdate = this.data.isUpdate;
      if (this.data.userInfo) {
        this.user = { ... { userName: this.data.userInfo.userName, label: this.data.userInfo.formattedName, _id: this.data.userInfo._id } };
        this.roles = { ...this.data.userInfo.roles };
      } else {
        this.user = {};
        this.roles = {}
      };
    }
  }

  public filterRecipientsList(): void {
    if (this.recipientsMaster) {
      this.recipients = of(this.recipientsMaster.filter(mas => {
        if (typeof this.user === 'string' && mas.value.toLowerCase().indexOf(this.user.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.recipients) {
        this.recipients = of([]);
      }
    }
  }

  private isRoleAssigned(): boolean {
    let flage = false;
    this.error.userName = "";
    Object.keys(this.roles).map(role => {
      if (this.roles[role] === true) {
        flage = true;
        this.error.roles = "";
      }
    });
    if (!flage) {
      this.error.roles = "required";
    }
    return flage;
  };


  public displayName(user): string {
    return user ? user.label : '';
  }

  public addUser(): void {
    if (typeof this.user === 'string' || this.user.userName === "") {
      this.error.userName = "required";
    } else if (this.isRoleAssigned()) {
      this.error = { userName: "", roles: "" };
      const getRecipientObserver: PartialObserver<any | HttpErrorResponse> = {
        next: (result: any) => {
          if (result.status === 'success') {
            this.toastr.success(this.i18nService.translate.instant('admin.internalUser.User-Added-Successfully'));
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
      const user = this.user;
      user.roles = this.roles;
      this.userService.addInternalUser(user).subscribe(getRecipientObserver);
    }
  }

}
