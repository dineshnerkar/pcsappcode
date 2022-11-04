import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { ReasonsApplicableForFilter } from '../../constants/filter';
import { ReasonService } from '../../services/reason.service';

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ReasonsComponent implements OnInit {
  public loading: boolean;
  public isUpdate: boolean;
  public reason: any = {};
  public applicableFor: any = { ...ReasonsApplicableForFilter };
  public error: any = {};
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ReasonsComponent>,
    private toastr: ToastrService,
    private i18nService: I18nService,
    private reasonService: ReasonService) { }

  ngOnInit() {
    if (this.data && this.data.reason) {
      this.reason = { ...this.data.reason };
      this.isUpdate = this.data.isUpdate;
      this.applicableFor = {
        ...{
          print: this.data.reason.print ? this.data.reason.print : false,
          reprint: this.data.reason.reprint ? this.data.reason.reprint : false,
          recall: this.data.reason.recall ? this.data.reason.recall : false,
          reconcile: this.data.reason.reconcile ? this.data.reason.reconcile : false,
        }
      };
    } else {
      this.reason = { name: '' };
    }
  };

  private validateApplicableFor(): boolean {
    let valid = false;
    if (this.reason.print || this.reason.reprint || this.reason.recall || this.reason.reconcile) {
      valid = true;
    } else {
      this.error = { name: '', applicableFor: 'required' };
    }
    return valid;
  }

  public addReason(): void {
    if (this.reason && (this.reason.name === undefined || this.reason.name === '')) {
      this.error = { name: 'required', applicableFor: '' };
    } else if (this.validateApplicableFor()) {
      this.error = { name: '', applicableFor: '' };
      const getRecipientObserver: PartialObserver<any> = {
        next: (result: any) => {
          if (result.status === 'success') {
            this.toastr.success(this.i18nService.translate.instant('reason-component.Reason-Added-Successfully'), '');
            this.dialogRef.close({ 'status': 'success' });
          } else {
            this.toastr.error(this.i18nService.translate.instant('reason-component.Error-in-adding-Reason'));
            this.dialogRef.close({ 'status': 'error' });
          }
        },
        error: () => {
          this.toastr.error(this.i18nService.translate.instant('reason-component.Error-in-adding-Reason'));
          this.dialogRef.close({ 'status': 'error' });
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.reasonService.addReason(this.reason).subscribe(getRecipientObserver);
    }
  }
}
