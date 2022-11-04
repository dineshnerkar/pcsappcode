import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PartialObserver } from 'rxjs';
import { Reason } from 'src/app/models/user';
import { I18nService } from 'src/app/service/i18n.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { ReasonsApplicableForFilter } from '../../constants/filter';
import { ReasonService } from '../../services/reason.service';
import { ReasonsComponent } from './reasons.component';

@Component({
  selector: 'app-reasons-list',
  templateUrl: './reasons-list.component.html',
  styleUrls: ['./reasons-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ReasonsListComponent implements OnInit {
  public loading: boolean;
  public displayedColumns: string[] = ['reasonText', 'reasons', 'actions'];
  public reasonList: Reason[];
  public applicableFor: any = { ...ReasonsApplicableForFilter };

  constructor(public dialog: MatDialog,
    private i18nService: I18nService,
    private toastr: ToastrService,
    private reasonService: ReasonService) {
  }

  ngOnInit() {
    this.reasonList = [];
    this.getReasonList();
  }

  public getReasonList(): void {
    const getReasonObserver: PartialObserver<any> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.reasonList = result.payload;
        } else {
          this.toastr.error(this.i18nService.translate.instant('reasons-list-component.Error-in-getting-Reason-List'));
        }
      },
      error: () => {
        this.toastr.error(this.i18nService.translate.instant('reasons-list-component.Error-in-getting-Reason-List'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.reasonService.getReasonList(this.applicableFor).subscribe(getReasonObserver);
  }

  public updateReasonDialog(reasonInfo?): void {
    const config: any = {
      width: '600px',
    }
    if (reasonInfo) {
      config.data = { ...{ reason: reasonInfo, isUpdate: true } };
    } else {
      config.data = { ...{ reason: undefined, isUpdate: false } };
    }
    const reasonDialogRef: MatDialogRef<ReasonsComponent> = this.dialog.open(ReasonsComponent, config);
    reasonDialogRef.afterClosed().subscribe(result => {
      if (result && result.status === 'success') {
        this.applicableFor = { ...ReasonsApplicableForFilter };
        this.getReasonList();
      }
    });
  };

  public deleteReason(row): void {
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
        const deleteReasonObserver: PartialObserver<any> = {
          next: (result: any) => {
            if (result.status === 'success') {
              this.toastr.success(this.i18nService.translate.instant('reasons-list-component.Reason-Deleted-Successfully'));
              this.applicableFor = { ...ReasonsApplicableForFilter };
              this.getReasonList();
            } else {
              this.toastr.error(this.i18nService.translate.instant('reasons-list-component.Error-in-getting-Reason-List'));
            }
          },
          error: () => {
            this.toastr.error(this.i18nService.translate.instant('reasons-list-component.Error-in-getting-Reason-List'));
          },
          complete: () => {
            this.loading = false;
          }
        };
        this.loading = true;
        this.reasonService.deleteReason({ "_id": row._id }).subscribe(deleteReasonObserver);
      }
    });

  }

  public clearFilter(): void {
    this.applicableFor = { ...ReasonsApplicableForFilter };
    this.getReasonList();
  }
}
