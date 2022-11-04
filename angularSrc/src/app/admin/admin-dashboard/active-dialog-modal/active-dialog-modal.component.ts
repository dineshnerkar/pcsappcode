import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartialObserver } from 'rxjs';
import { UserService } from 'src/app/admin/services/user.service';
@Component({
  selector: 'app-active-dialog-modal',
  templateUrl: './active-dialog-modal.component.html',
  styles: ["../admin-dashboard.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ActiveDialogModalComponent implements OnInit {
  public isLoding: boolean;
  public intUserCount: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<ActiveDialogModalComponent>,
    private userService: UserService
  ) { }

  ngOnInit() {
    if (this.data) {
      this.intUserCount = this.data.count;
    }
  }

  public updateInternalUserCount() {
    const countUpdateObservable: PartialObserver<any | HttpErrorResponse> = {
      next: (result) => {
        if (result.status === 'success') {
          this.dialogRef.close();
        }
      },
      error: () => {

      },
      complete: () => {
        this.isLoding = false;
      }
    };
    this.isLoding = true;
    this.userService.updateUserCount({ count: this.intUserCount }).subscribe(countUpdateObservable);
  }

}
