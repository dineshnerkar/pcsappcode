import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { Observable, of, PartialObserver } from 'rxjs';
import { UserService } from 'src/app/admin/services/user.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { InternalUserComponent } from '../internal-user-list/internal-user.component';
import { I18nService } from 'src/app/service/i18n.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SelectOption } from 'src/app/admin/models/selectOption';
import { ToastrService } from 'ngx-toastr';
import { InternalUserListFilter } from 'src/app/admin/constants/filter';
@Component({
  selector: 'app-internal-user-list',
  templateUrl: './internal-user-list.component.html',
  styleUrls: ['./internal-user-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InternalUserListComponent implements OnInit {

  public loading: boolean;
  public recipients: Observable<SelectOption[]>;
  public recipientsMaster: SelectOption[];
  public internalUserListFilter: any = { ...InternalUserListFilter };
  public displayedColumns: string[] = ['firstName', 'lastName', 'userName', 'email', 'role', 'actions'];
  public userList: any[];
  public roles: any[] = [{ label: 'Issued Print Coordinator', value: 'imp_issued_print_coordinator' }, { label: 'Controlled Print Coordinator', value: 'imp_controlled_print_coordinator' }
    , { label: 'Issued Print Reprint', value: 'imp_issued_print_reprint' }, { label: 'Controlled Print Reprint', value: 'imp_controlled_print_reprint' },
  { label: 'Issued Print Only', value: 'imp_issued_print_only' }, { label: 'Controlled Print Only', value: 'imp_controlled_print_only' }
    , { label: 'Reconciliation', value: 'imp_reconciliation' }, { label: 'Admin', value: 'imp_admin' }, {label: 'Recipient Only', value:'imp_recipient'}
  ]

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private i18nService: I18nService,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.userList = [];
    this.loading = false;
    this.recipients = of([]);
    this.recipientsMaster = [];
    this.getAllInternalUserList();
    this.getAddedInternalUser();
    this.userService.userList.subscribe(result => {
      if (result && result.length > 0) {
        this.recipientsMaster = result;
        this.recipients = of(result);
      }
    });
  }

  public getAddedInternalUser(): void {
    const getAddedInternalUserObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.userList = result.payload;
        } else {
          this.userList = [];
        }
      },
      error: () => {
        this.toastr.error(this.i18nService.translate.instant('internal-user-list-component.Error-in-getting-Internal-User-List'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.userService.getAddedInternalUsers(this.internalUserListFilter).subscribe(getAddedInternalUserObserver);
  }

  public getAllInternalUserList(): void {
    if (this.recipientsMaster.length === 0) {
      const getRecipientObserver: PartialObserver<any | HttpErrorResponse> = {
        next: (result: any) => {
          if (result.status === 'success') {
            const userList = result.payload.sort((a, b) => {
              return a.label.toLowerCase() < b.label.toLowerCase() ? -1 : a.label.toLowerCase() > b.label.toLowerCase() ? 1 : 0;
            });
            this.userService.userList.next(userList);
          }
        },
        error: () => {
          this.toastr.error(this.i18nService.translate.instant('internal-user-list-component.Error-in-getting-Internal-User-List'));
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.userService.getAllInternalUserList().subscribe(getRecipientObserver);
    }
  }

  public filterRecipientsList(): void {
    if (this.recipientsMaster) {
      this.recipients = of(this.recipientsMaster.filter(mas => {
        if (typeof this.internalUserListFilter.user === 'string' && mas.value.toLowerCase().indexOf(this.internalUserListFilter.user.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.recipients) {
        this.recipients = of([]);
      }
    }
  }

  public displayName(user): string {
    return user ? user.label : '';
  }

  public openAddInternalUserDialog(internalUserInfo?): void {
    const config: MatDialogConfig = {
      width: '700px',
    }
    if (internalUserInfo) {
      config.data = { isUpdate: true, userInfo: internalUserInfo };
    } else {
      config.data = { isUpdate: false, userInfo: undefined };
    }

    const internalUserDialogRef: MatDialogRef<InternalUserComponent> = this.dialog.open(InternalUserComponent, config);
    internalUserDialogRef.afterClosed().subscribe(result => {
      if (result && result.status === 'success') {
        this.internalUserListFilter = { ...InternalUserListFilter };
        this.getAddedInternalUser();
      }
    });
  }

  public deleteInternalUser(row): void {
    const dialogRef: MatDialogRef<DialogComponent> = this.dialog.open(DialogComponent, {
      data: {
        isInternalUser: true,
        userId: row._id
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.status === 'success') {
        this.internalUserListFilter = { ...InternalUserListFilter };
        this.getAddedInternalUser();
      }
    });
  }

  public clearFilter(): any {
    this.internalUserListFilter = { ...InternalUserListFilter };
    this.getAddedInternalUser();
  }
}
