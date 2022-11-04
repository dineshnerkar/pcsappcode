import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService } from '../service/document.service';
import { SocketService } from '../service/socket.service';
import { PartialObserver } from 'rxjs/internal/types';
import { HttpErrorResponse } from '@angular/common/http';
import { PrintService } from '../http-services/print.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import { commonConstant } from '../constants/common';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-print-dashboard',
  templateUrl: './print-dashboard.component.html',
  styleUrls: ['./print-dashboard.component.scss']
})
export class PrintDashboardComponent implements OnInit {
  public docInfo: any;
  public printTypes = commonConstant.PrintTypes;
  public user: any;
  public roles: any;

  constructor(private router: Router,
    private userService: UserService,
    private socketService: SocketService,
    private toast: ToastrService,
    private documentService: DocumentService,
    private printService: PrintService,
    private i18nService: I18nService) {
      this.docInfo = undefined;
     }

  ngOnInit() {
    this.documentService.document.subscribe((res: any) => {
      if (res) {
        this.getDocumentInfo(res);
      }
    });
    this.userService.user.subscribe((result: any) => {
      if (result) {
        this.user = result;
      }
    });
    this.userService.userRole.subscribe((result: any) => {
      if (result) {
        this.roles = result;
      }
    });

  }

  public getDocumentInfo(docInfo): any {
    this.docInfo = undefined;
    const getDocumentObserver: PartialObserver<any> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.docInfo = result.payload;
          this.documentService.setDocumentInfo({
            '@infocardNumber': this.docInfo.infocardNumber,
            '@infocardId': this.docInfo.infocardId,
            '@revision': this.docInfo.revision,
            '@parentInfocardTypeName': this.docInfo.parentInfocardTypeName ? this.docInfo.parentInfocardTypeName : this.docInfo.infocardTypeName
          });
        } else {
          this.toast.error(this.i18nService.translate.instant('print-dashboard-component.Error-in-getting-Document-Information'));
        }

      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(this.i18nService.translate.instant('print-dashboard-component.Error-in-getting-Document-Information'));
      },
      complete: () => {

      }
    };
    this.printService.getDocument(docInfo).subscribe(getDocumentObserver);
  }

  printInfo(type) {
    this.documentService.setPrintType(type);
    this.socketService.getPrinterList();
    this.router.navigate(['print']);
  }

  rePrintInfo(type, recall?, reconciliation?) {
    this.documentService.setPrintType(type);
    if (recall || reconciliation) {
      this.documentService.setReprintDashboardType(recall, reconciliation);
    }
    this.socketService.getPrinterList();
    this.router.navigate(['rePrint']);
  }

  redirectToAuditTrail(type): any {
    this.documentService.setPrintType(type);
    this.socketService.getPrinterList();
    this.router.navigate(['audit']);
  }
}
