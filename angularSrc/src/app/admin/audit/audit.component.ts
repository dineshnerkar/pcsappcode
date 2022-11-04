import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PartialObserver } from 'rxjs';
import { I18nService, ReportService } from 'src/app/service';
import { AdminAuditFilter, AdminAuditTypes } from '../constants/filter';
import { UserService } from '../services/user.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuditComponent implements OnInit {
  public isLoading: boolean;
  public auditList: any[];
  public adminAuditTypes: string[] = { ...AdminAuditTypes };
  public adminAuditFilter: any = { ...AdminAuditFilter };
  public displayedColumns: string[] = ['type', 'name', 'updatedAt', 'updatedBy'];
  constructor(private userService: UserService, private toaster: ToastrService, private i18nService: I18nService, private reportService: ReportService) { }

  ngOnInit() {
    this.getAdminAudit();
  }
  public getAdminAudit(): void {
    const auditListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.auditList = result.payload;
        } else {
          this.auditList = [];
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('admin.audit.getDataError'));
      },
      complete: () => {
        this.isLoading = false;
      }
    };
    this.isLoading = true;
    this.userService.getAdminAudit(this.adminAuditFilter).subscribe(auditListObserver);
  }

  public downloadAsPDF() {
    this.reportService.exportTableAsPdf(this.getForPdfExport(),
      this.getColumnWidthForPdfExport(),
      this.i18nService.translate.instant('admin.audit.adminAudit'));
  }

  public downloadReport(): void {
    const workBook = XLSX.utils.book_new();
    const data = [];
    this.auditList.map((item: any) => {
      const pObj = this.getXlsxObject(item);
      data.push(pObj);
    });
    const workSheet = XLSX.utils.json_to_sheet(data);
    workSheet['A1'].cellStyles = { fill: { bgColor: { rgb: "black" } } };
    XLSX.utils.book_append_sheet(workBook, workSheet, 'data');
    XLSX.writeFile(workBook, 'report.xlsx');
  }
  private getForPdfExport() {
    const data = [[]];
    data[0].push({ text: this.i18nService.translate.instant('admin.audit.eventType'), bold: true, alignment: "center" });
    data[0].push({ text: this.i18nService.translate.instant('admin.audit.value'), bold: true, alignment: "center" });
    data[0].push({ text: this.i18nService.translate.instant('admin.audit.eventDateTime'), bold: true, alignment: "center" });
    data[0].push({ text: this.i18nService.translate.instant('admin.audit.owner'), bold: true, alignment: "center" });
    this.auditList.map(audit => {
      const tempData = [
        { text: audit.type, alignment: 'center' },
        { text: audit.name, alignment: 'center' },
        { text: this.reportService.getReportDateWithTime(audit.updatedAt), alignment: 'center' },
        { text: audit.updatedBy, alignment: 'center' }
      ];
      data.push(tempData);
    });
    return data;
  }
  private getColumnWidthForPdfExport(): string[] {
    return [
      'auto',
      'auto',
      'auto',
      'auto'
    ];
  }
  private getXlsxObject(data: any) {
    const returnData: any = {};
    returnData[this.i18nService.translate.instant('admin.audit.eventType')] = data.type;
    returnData[this.i18nService.translate.instant('admin.audit.value')] = data.name;
    returnData[this.i18nService.translate.instant('admin.audit.eventDateTime')] = this.reportService.getReportDateWithTime(data.updatedAt);
    returnData[this.i18nService.translate.instant('admin.audit.owner')] = data.updatedBy;
    return returnData;
  }

}
