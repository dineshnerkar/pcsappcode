import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PartialObserver } from 'rxjs';
import { Printer } from 'src/app/models/user';
import { I18nService } from 'src/app/service/i18n.service';
import { PrinterService } from '../../services/printer.service';
@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrinterComponent implements OnInit {
  public loading: boolean;
  public error: any = {};
  public printer: Printer;
  public isUpdate: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PrinterComponent>,
    private toastr: ToastrService,
    private i18nService: I18nService,
    private printerService: PrinterService,
  ) { }

  ngOnInit() {
    this.printer = {} as Printer;
    if (this.data) {
      this.printer = this.data.printer ? { ...this.data.printer } : {} as Printer;
      this.isUpdate = this.data.isUpdate;
      this.printer.isWhiteList = this.data.isWhiteList;
    }
  }

  public updatePrinter(): void {
    if (this.printer.name) {
      this.error.name = "";
      const getRecipientObserver: PartialObserver<any> = {
        next: (result: any) => {
          if (result.status === 'success') {
            if (this.printer._id) {
              this.toastr.success(this.i18nService.translate.instant('printer-component.Printer-Added-Successfully'));
            } else {
              this.toastr.success(this.i18nService.translate.instant('printer-component.Printer-Updated-Successfully'));
            }
            this.dialogRef.close({ 'status': 'success' });
          } else {
            this.toastr.error(this.i18nService.translate.instant('printer-component.Error-in-Adding-Printer'));
            this.dialogRef.close({ 'status': 'error' });
          }
        },
        error: () => {
          this.toastr.error(this.i18nService.translate.instant('printer-component.Error-in-Adding-Printer'));
          this.dialogRef.close({ 'status': 'error' });
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.printerService.addPrinter(this.printer).subscribe(getRecipientObserver);
    } else {
      this.error.name = "required";
    }
  }
}
