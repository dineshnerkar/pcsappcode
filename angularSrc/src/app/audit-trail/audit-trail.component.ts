import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PrintService } from '../http-services/print.service';
import { PartialObserver } from 'rxjs/internal/types';
import { HttpErrorResponse } from '@angular/common/http';
import { SocketService } from '../service/socket.service';
import { MatDialog, PageEvent } from '@angular/material';
import { DocumentService } from '../service/document.service';
import { ReportService } from '../service/report.service';
import { FilterConstant, PaginatorKeys } from '../constants/filter';
import { commonConstant } from '../constants/common';
import { Observable, of } from 'rxjs';
import { SelectOption } from '../models/selectOption';
import { I18nService } from '../service/i18n.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AuditTrailComponent implements OnInit {

  public controlledPrintList: Observable<SelectOption[]>;
  public controlledPrintListMaster: SelectOption[];
  public printOwnerList: Observable<SelectOption[]>;
  public printOwnerListMaster: SelectOption[];
  public loader: boolean;
  public printType: any;
  public filterObj = JSON.parse(JSON.stringify(FilterConstant));
  public paginatorKeys = JSON.parse(JSON.stringify(PaginatorKeys));
  public documentList: any[];
  public printerList: any;
  public document: any;
  public recipients: Observable<SelectOption[]>;
  public recipientsMaster: SelectOption[];
  public expandedElement: any;
  public displayedColumns: string[] = ['controlled_copy', 'type', 'Print_Owner', 'printer', 'Recipient', 'Reason', 'userInput', 'profile', 'Print_pages', 'Print_Date', 'Print_Status'];
  public openSelectPrinter: boolean;
  public docInfo: any;
  public commonConstant = commonConstant;
  constructor(
    private printService: PrintService,
    private socketService: SocketService,
    private documentService: DocumentService,
    private reportsService: ReportService,
    public dialog: MatDialog,
    private i18nService: I18nService) {
    this.recipients = of([]);
    this.printOwnerList = of([]);
    this.controlledPrintList = of([]);
    this.controlledPrintListMaster = [];
    this.recipientsMaster = [];
    this.printOwnerListMaster = [];
    this.socketService.printerList.subscribe(printer => {
      if (printer) {
        this.printerList = printer;
      }
    });
    this.openSelectPrinter = false;
  }

  public pad(num, size) {
    const s = '00' + num;
    return s.substr(s.length - size);
  }

  public handlePageEvent(event: PageEvent) {
    this.paginatorKeys.pageIndex = event.pageIndex;
    this.applyFilter();
  }
  public ngOnInit(): void {
    this.getRecipientData();
    this.docInfo = this.documentService.document.value
    this.documentService.printType.subscribe(printType => {
      if (printType) {
        this.printType = printType;
        if (this.printType === commonConstant.PrintTypes.IP) {
          this.displayedColumns.push('Update_overdue_date');
          this.displayedColumns.push('reconcile_comment');
          this.displayedColumns.push('reconcile_printReturned');
          this.displayedColumns.push('reconcile_deviationNumber');
          this.displayedColumns.push('reconcile_outcomeStatus');
        } else {
          this.displayedColumns.push('recall_comment');
        }
        this.getAuditData({ 'printType': printType });
      }
    });
  }

  public getRecipientData() {
    const getRecipientObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.loader = false;
        if (result.status === 'success') {
          const sortedList = result.payload.sort((a, b) => {
            const x = a.label.toLowerCase();
            const y = b.label.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
          });
          this.recipientsMaster = sortedList;
          this.printOwnerListMaster = sortedList;
          this.recipients = of(sortedList);
          this.printOwnerList = of(sortedList);
        } else {
        }
      },
      error: () => {
        this.loader = false;
      },
      complete: () => {

      }
    };
    this.printService.getInternalRecipient().subscribe(getRecipientObserver);
  }

  public applyFilter(): any {
    this.loader = true;
    let reqObj = {
      documentName: this.filterObj.documentName,
      type: this.filterObj.type,
      revision: this.filterObj.revision,
      printNumber: this.filterObj.printNumber,
      printOwner: this.filterObj.printOwner,
      printStartDate: this.filterObj.startDate ?
        this.getUTCDate(this.filterObj.startDate) : null,
      printEndDate: this.filterObj.endDate ?
        this.getUTCDate(this.filterObj.endDate) : null,
      recipient: this.filterObj.recipient,
      printStatus: this.filterObj.printStatus,
      pageNumber: this.paginatorKeys.pageIndex,
      pageSize: this.paginatorKeys.pageSize,
      printType: this.printType
    };
    reqObj = JSON.parse(JSON.stringify(reqObj), (key, value) => {
      if (value == null || value === '' || value === [] || value === {}) {
        return undefined;
      }
      return value;
    });
    this.getAuditData(reqObj);
  }

  public getUTCDate(date: Date): any {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1, 2)}-${date.getDate()}`;
  }

  public clearFilter(): any {
    this.filterObj = JSON.parse(JSON.stringify(FilterConstant));
    this.printOwnerList = of(this.printOwnerListMaster);
    this.controlledPrintList = of(this.controlledPrintListMaster);
    this.recipients = of(this.recipientsMaster);
    this.getAuditData({ 'printType': this.printType });
  }

  public getAuditData(req: any): void {
    const getAuditDataObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.documentList = this.setDocumentList(result.payload);
          this.paginatorKeys.count = result.count;
        }
        this.loader = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loader = false;
      },
      complete: () => {

      }
    };
    req.pageNumber = this.paginatorKeys.pageIndex;
    req.pageSize = this.paginatorKeys.pageSize;
    this.printService.getAuditData(req).subscribe(getAuditDataObserver);
  }


  public setDocumentList(temp: any, type?: any): any {
    if (temp && temp.length) {
      const controlledPrintList: SelectOption[] = [];
      temp.map((t, index) => {
        controlledPrintList.push({ label: t["#controlled_copy"], value: t["#controlled_copy"] });
        if (type && t["#printStatus"] && type === t["#printStatus"]) {
          temp.splice(index, 1);
        }
        if (t["#pagesToPrint"] && t["#pagesToPrint"].length > 0) {
          t["#pagesToPrint"] = t['#pagesToPrint'].map(page => Number(page) + 1).map(ps => ps + '');
        }
        if (t.profileFields) {
          let ip = '';
          t.profileFields.filter(f => f.show).map(i => {
            ip = ip + `${i.name} : ${i.value}`;
          });
          t.userInput = ip;
        }
        return t;
      });
      temp.sort((a, b) => {
        const dateA = new Date(a["#printDateTime"]).getTime();
        const dateB = new Date(b["#printDateTime"]).getTime();
        if (dateA > dateB) {
          return -1;
        } else if (dateB > dateA) {
          return 1;
        } else {
          if (a["#controlled_copy"] > b["#controlled_copy"]) {
            return -1;
          } else if (b["#controlled_copy"] > a["#controlled_copy"]) {
            return 1;
          } else {
            return 0;
          }
        }
      });
      this.controlledPrintListMaster = [...new Map(controlledPrintList.map(item =>
        [item['value'], item])).values()];
      this.controlledPrintList = of(this.controlledPrintListMaster);
      return temp;
    } else {
      return [];
    }
  }

  public filterPrintOwnerList(): void {
    if (this.printOwnerListMaster) {
      this.printOwnerList = of(this.printOwnerListMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.filterObj.printOwner.toLowerCase()) === 0) {
          return mas;
        }
      }));
    }
    if (!this.printOwnerList) {
      this.printOwnerList = of([]);
    }
  }

  public filterRecipientsList(): void {
    if (this.recipientsMaster) {
      this.recipients = of(this.recipientsMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.filterObj.recipient.toLowerCase()) === 0) {
          return mas;
        }
      }));
    }
    if (!this.recipients) {
      this.recipients = of([]);
    }
  }

  public downloadAsPDF() {
    this.reportsService.exportTableAsPdf(this.getForPdfExport(),
      this.getColumnWidthForPdfExport(),
      this.printType === 'IP' ? this.i18nService.translate.instant('audit-trail-component.Issued-Prints-Audit') : this.i18nService.translate.instant('audit-trail-component.Controlled-Prints-Audit'));
  }

  getForPdfExport() {
    const data = [];
    data.push([{ text: this.printType === 'IP' ? this.i18nService.translate.instant('audit-trail-component.Issued-Print-Number') : this.i18nService.translate.instant('audit-trail-component.Controlled-Print-Number'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Event'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Reprint-Pages'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Print-Owner'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Printer-Name'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Recipient'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Reason'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.User-Input'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Profile'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Event-Date-Time'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('audit-trail-component.Print-Status'), bold: true, alignment: "center" }]);
    if (this.printType === commonConstant.PrintTypes.IP) {
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Due-Date'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Reconcile-Comments'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Reconcile-printReturned'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Reconcile-deviationNumber'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Reconcile-outcomeStatus'), bold: true, alignment: "center" });
    };
    if (this.printType === commonConstant.PrintTypes.CP) {
      data[0].push({ text: this.i18nService.translate.instant('audit-trail-component.Recall-Comments'), bold: true, alignment: "center" });
    };
    this.documentList.map(document => {
      const tempData = [
        { text: document["#controlled_copy"], alignment: 'center' },
        { text: document["#type"], alignment: 'center' },
        { text: document["#type"] === 'Print' ? "All" : document["#pages"], alignment: 'center' },
        { text: document['#printOwner'].name, alignment: 'center' },
        { text: document['#printer'], alignment: 'center' },
        { text: document['#recipient'].name, alignment: 'center' },
        { text: document['#printReason'], alignment: 'center' },
        { text: document['userInput'], alignment: 'center' },
        { text: document['#profile'], alignment: 'center' },
        { text: this.reportsService.getReportDateWithTime(document['#printDateTime']), alignment: 'center' },
        { text: document['#printStatus'], alignment: 'center' }
      ];
      if (this.printType === commonConstant.PrintTypes.IP) {
        tempData.push({ text: this.reportsService.getReportDateWithOutTime(document["#overdueUpdateDate"]), alignment: 'center' });
        tempData.push({ text: document["comment"], alignment: 'center' });
        tempData.push({ text: document["printReturned"], alignment: 'center' });
        tempData.push({ text: document["deviationNumber"], alignment: 'center' });
        tempData.push({ text: document["outcomeStatus"], alignment: 'center' });
      };
      if (this.printType === commonConstant.PrintTypes.CP) {
        tempData.push({ text: document["comment"], alignment: 'center' });
      };
      data.push(tempData);
    });
    return data;
  }

  getColumnWidthForPdfExport() {
    const data = [
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto',
      'auto'
    ];
    if (this.printType === commonConstant.PrintTypes.IP) {
      data.push('auto');
      data.push('auto');
      data.push('auto');
      data.push('auto');
      data.push('auto');
    };
    if (this.printType !== commonConstant.PrintTypes.IP) {
      data.push('auto');
    };
    return data;
  }

  getXlsxObject(data, type) {
    let returnData = {};
    if (this.printType === commonConstant.PrintTypes.IP) {
      returnData[this.i18nService.translate.instant('audit-trail-component.Issued-Print-Number')] = data['#controlled_copy'];
    } else {
      returnData[this.i18nService.translate.instant('audit-trail-component.Controlled-Print-Number')] = data['#controlled_copy'];
    }
    returnData[this.i18nService.translate.instant('audit-trail-component.Event')] = type;
    returnData[this.i18nService.translate.instant('audit-trail-component.Reprint-Pages')] = type === 'Print' ? 'All' : data["#pages"];
    returnData[this.i18nService.translate.instant('audit-trail-component.Print-Owner')] = data["#printOwner"].name;
    returnData[this.i18nService.translate.instant('audit-trail-component.Printer-Name')] = data["#printer"];
    returnData[this.i18nService.translate.instant('audit-trail-component.Recipient')] = data["#recipient"].name;
    returnData[this.i18nService.translate.instant('audit-trail-component.Reason')] = data["#printReason"];
    returnData[this.i18nService.translate.instant('audit-trail-component.User-Input')] = data["userInput"];
    returnData[this.i18nService.translate.instant('audit-trail-component.Profile')] = data["#profile"];
    returnData[this.i18nService.translate.instant('audit-trail-component.Event-Date-Time')] = this.reportsService.getReportDateWithTime(data["#printDateTime"]);
    returnData[this.i18nService.translate.instant('audit-trail-component.Print-Status')] = data["#printStatus"];
    if (this.printType !== commonConstant.PrintTypes.IP) {
      returnData[this.i18nService.translate.instant('audit-trail-component.Recall-Comments')] = data["comment"];
    };
    if (this.printType === commonConstant.PrintTypes.IP) {
      returnData[this.i18nService.translate.instant('audit-trail-component.Due-Date')] = this.reportsService.getReportDateWithOutTime(data["#overdueUpdateDate"]);
      returnData[this.i18nService.translate.instant('audit-trail-component.Reconcile-Comments')] = data["comment"];
      returnData[this.i18nService.translate.instant('audit-trail-component.Reconcile-printReturned')] = data["printReturned"];
      returnData[this.i18nService.translate.instant('audit-trail-component.Reconcile-deviationNumber')] = data["deviationNumber"];
      returnData[this.i18nService.translate.instant('audit-trail-component.Reconcile-outcomeStatus')] = data["outcomeStatus"];
    }
    return returnData;
  }

  downloadReport(): void {
    const workBook = XLSX.utils.book_new(); // create a new blank book
    const data = [];
    this.documentList.map((item: any) => {
      const pObj = this.getXlsxObject(item, item['#type']);
      data.push(pObj);
    });
    const workSheet = XLSX.utils.json_to_sheet(data);
    workSheet['A1'].cellStyles = { fill: { bgColor: { rgb: "black" } } };
    XLSX.utils.book_append_sheet(workBook, workSheet, 'data'); // add the worksheet to the book
    XLSX.writeFile(workBook, 'report.xlsx'); // initiate a file download in browser
  }
}
