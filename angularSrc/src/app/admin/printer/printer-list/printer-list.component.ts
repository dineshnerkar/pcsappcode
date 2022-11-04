import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { DialogComponent } from '../../common/dialog/dialog.component';
import { PrinterService } from '../../services/printer.service';
import { PrinterComponent } from './printer.component';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.component.html',
  styleUrls: ['./printer-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrinterListComponent implements OnInit {

  public loading: boolean;
  public displayedColumns: string[] = ['printerName', 'status', 'actions'];
  public printerList: any[];
  public enableBlack: boolean;

  constructor(public dialog: MatDialog,
    private i18nService: I18nService,
    private printerService: PrinterService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.printerList = [];
    this.getPrinterList();
  }

  public getPrinterList(): void {
    const getPrinterObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.printerList = result.payload.printerList;
          this.enableBlack = result.payload.printerFlag;
        } else {
          this.printerList = [];
          this.enableBlack = false;
        }
      },
      error: () => {
        this.toastr.error(this.i18nService.translate.instant('printer-list-component.Error-in-getting-Printer-List'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.printerService.getPrinterList().subscribe(getPrinterObserver);
  }

  public updatePrinterConfiguration(): void {
    const getPrinterFilterObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.getPrinterList();
        }
      },
      error: () => {
        this.toastr.error(this.i18nService.translate.instant('printer-list-component.Error-in-getting-Printer-List'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.printerService.updatePrinterConfiguration({ "isWhiteList": this.enableBlack }).subscribe(getPrinterFilterObserver);
  }

  public openPrinterDialog(printerInfo?): void {
    const config: MatDialogConfig = {
      'width': '600px'
    } as MatDialogConfig;
    if (printerInfo) {
      config.data = { ...{ printer: printerInfo, isUpdate: true, isWhiteList: this.enableBlack } };
    } else {
      config.data = { ...{ printer: undefined, isUpdate: false, isWhiteList: this.enableBlack } };
    }
    const printerDialogRef: MatDialogRef<PrinterComponent> = this.dialog.open(PrinterComponent, config);
    printerDialogRef.afterClosed().subscribe(result => {
      if (result && result.status === 'success') {
        this.getPrinterList();
      }
    });
  }

  public deletePrinter(row): void {
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
        const deleteUserObserver: PartialObserver<any | HttpErrorResponse> = {
          next: (result: any) => {
            if (result.status === 'success') {
              this.toastr.success(this.i18nService.translate.instant('printer-list-component.Printer-Deleted-Successfully'), '');
              this.getPrinterList();
            }
          },
          error: () => {
            this.toastr.error(this.i18nService.translate.instant('printer-list-component.Error-in-getting-Printer-List'));
          },
          complete: () => {
            this.loading = false;
          }
        };
        this.loading = true;
        this.printerService.deletePrinter({ "_id": row._id }).subscribe(deleteUserObserver);
      }
    });
  }
}
