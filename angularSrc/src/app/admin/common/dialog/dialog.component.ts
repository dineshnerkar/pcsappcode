import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { I18nService } from 'src/app/service/i18n.service';
import { Observable, of, PartialObserver } from 'rxjs';
import { SelectOption } from '../../models/selectOption';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent {
  public loading: boolean;
  public showUserInput: boolean;
  public recipients: Observable<SelectOption[]>;
  public recipientsMaster: SelectOption[];
  public selectedUser: any;
  public error: any = {};
  public message: string = this.i18nService.translate.instant('admin.dialog-component.Are-you-sure-want-to-delete') //"Are you sure?";
  public confirmButtonText: string = this.i18nService.translate.instant('admin.dialog-component.Delete');
  public cancelButtonText: string = this.i18nService.translate.instant('admin.dialog-component.No');

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<DialogComponent>,
    private userService: UserService,
    private toastr: ToastrService,
    private i18nService: I18nService) {
    if (this.data) {
      this.message = this.data.message || this.message;
      if (this.data.buttonText) {
        this.confirmButtonText = this.data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = this.data.buttonText.cancel || this.cancelButtonText;
      }
      if (this.data.isInternalUser) {
        this.showUserInput = true;
        this.getInternalUsers();
      }
    }
  }

  public onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  public getInternalUsers(): void {
    const getAddedInternalUserObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.recipientsMaster = result.payload.filter(user => user._id !== this.data.userId).sort((a, b) => {
            return a.formattedName - b.formattedName;
          }).map(user => {
            return { label: user.formattedName, userName: user.userName, _id: user._id };
          });
          this.recipients = of([]);
        } else {
          this.recipientsMaster = [];
          this.recipients = of(this.recipientsMaster);
        }
      },
      error: () => {
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.userService.getAddedInternalUsers({}).subscribe(getAddedInternalUserObserver);
  }

  public filterRecipientsList(): void {
    if (this.recipientsMaster) {
      this.recipients = of(this.recipientsMaster.filter(mas => {
        if (typeof this.selectedUser === 'string' && mas.label.toLowerCase().indexOf(this.selectedUser.toLowerCase()) === 0) {
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
  public assignUser(): void {
    if (typeof this.selectedUser === 'undefined' || typeof this.selectedUser === 'string' || this.selectedUser.userName === '') {
      this.error = { name: 'required' };
    } else {
      const deleteUserObserver: PartialObserver<any | HttpErrorResponse> = {
        next: (result: any) => {
          if (result.status === 'success') {
            this.toastr.success(this.i18nService.translate.instant('admin.internalUser.deleteSuccessful'));
            this.dialogRef.close({ 'status': 'success' });
          } else {
            this.toastr.error(this.i18nService.translate.instant('admin.internalUser.deleteError'));
            this.dialogRef.close({ 'status': 'error' });
          }
        },
        error: () => {
          this.toastr.error(this.i18nService.translate.instant('admin.internalUser.deleteError'));
          this.dialogRef.close({ 'status': 'error' });
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.userService.assignInternalUsers({ _id: this.data.userId, newUserId: this.selectedUser._id }).subscribe(deleteUserObserver);
    }
  }

}
