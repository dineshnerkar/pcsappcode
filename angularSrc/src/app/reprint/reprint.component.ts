import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PrintService } from '../http-services/print.service';
import { PartialObserver } from 'rxjs/internal/types';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, PageEvent } from '@angular/material';
import { DocumentService } from '../service/document.service';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../service/report.service';
import { UserService } from '../service/user.service';
import { RecallService } from '../http-services/recall.service';
import { Observable, of } from 'rxjs';
import { SelectOption } from '../models/selectOption';
import { commonConstant } from '../constants/common';
import { User } from '../models/user';
import { FilterConstant, PaginatorKeys } from '../constants/filter';
import { SelectionModel } from '@angular/cdk/collections';
import { DateService } from '../service/date.service';
import { I18nService } from '../service/i18n.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-reprint',
  templateUrl: './reprint.component.html',
  styleUrls: ['./reprint.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ReprintComponent implements OnInit {

  public filterConstant = JSON.parse(JSON.stringify(FilterConstant));
  public paginatorKeys = JSON.parse(JSON.stringify(PaginatorKeys));
  public commonConstant = commonConstant;
  public todayDate: Date = new Date();
  public displayedColumns: string[] = ['Controlled_Print', 'Print_Owner', 'Recipient', 'Reason', 'userInput', 'profile', 'Print_Date', 'Print_Status', 'Reprint_Count', 'Actions'];
  public displayedColumnsReprint: string[] = ['Controlled_Print', 'Print_Owner', 'Recipient', 'ReprintReason', 'userInput', 'ReprintProfile', 'Print_pages', 'Print_Date', 'Print_Status']
  public reconcileDisplayedColumns: string[] = ['Controlled_Print', 'pages_to_print', 'pages_returned', 'outcome', 'outcomeStatus', 'comments', 'Deviation_No'];

  public user: User;

  public controlledPrintList: Observable<SelectOption[]>;
  public printOwnerList: Observable<SelectOption[]>;
  public recipients: Observable<SelectOption[]>;
  public recallReasons: Observable<SelectOption[]>;
  public reconciliationReasons: Observable<SelectOption[]>;

  public recallReasonsMaster: SelectOption[];
  public reconciliationReasonsMaster: SelectOption[];
  public outcomeStatusList: SelectOption[];
  public recipientsMaster: SelectOption[];
  public printOwnerListMaster: SelectOption[];
  public controlledPrintListMaster: SelectOption[];

  public selection: any;
  public newDueDate: any;
  public reprintDashboardType: any;
  public expandedElement: any;
  public recallDoc: any;
  public documentInfo: any;
  public document: any;

  public reconciliationDocs: any[];
  public documentList: any[];

  public updateDueDate: boolean;
  public showPopup: boolean;
  public showNote: boolean;
  public reconciliationDisabled: boolean;
  public loader: boolean;

  public overDueReason: string;
  public recallReason: string;
  public printType: string;

  public profileList: any[];
  constructor(
    private toast: ToastrService,
    private printService: PrintService,
    private userService: UserService,
    private documentService: DocumentService,
    private recallService: RecallService,
    private router: Router,
    private reportsService: ReportService,
    private dateService: DateService,
    public dialog: MatDialog,
    private i18nService: I18nService
  ) {
    this.recallDoc = {};
    this.recallReason = '';
    this.reconciliationDocs = [];
    this.recallReasonsMaster = [];
    this.controlledPrintListMaster = [];
    this.recipientsMaster = [];
    this.printOwnerListMaster = [];
    const initialSelection = [];
    const allowMultiSelect = true;
    this.recallReasons = of([]);
    this.recipients = of([]);
    this.printOwnerList = of([]);
    this.controlledPrintList = of([]);
    this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection);
    this.showPopup = false;
    this.userService.user.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  public downloadAsPDF(): void {
    this.reportsService.exportTableAsPdf(this.getForPdfExport(),
      this.getColumnWidthForPdfExport(),
      this.printType === commonConstant.PrintTypes.IP ? this.i18nService.translate.instant('reprint-component.Issued-Print-Dashboard') : this.i18nService.translate.instant('reprint-component.Controlled-Print-Dashboard'));
  }

  private getForPdfExport(): any[] {
    const data = [];
    data.push([{ text: this.printType === commonConstant.PrintTypes.IP ? this.i18nService.translate.instant('reprint-component.Issued-Print-Number') : this.i18nService.translate.instant('reprint-component.Controlled-Print-Number'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Type'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Reprint-Page'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Print-Owner'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Recipient'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Reason'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Profile'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Print-Date'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Print-Status'), bold: true, alignment: "center" },
    { text: this.i18nService.translate.instant('reprint-component.Reprint-Count'), bold: true, alignment: "center" }]);
    if (this.printType === commonConstant.PrintTypes.IP) {
      // data[0].splice(5, 0, { text: this.i18nService.translate.instant('reprint-component.User-Input'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Reconciliation-Due-Date'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Reconciliation-Status'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Reconciliation-Overdue'), bold: true, alignment: "center" });
    } else {
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Recall-Status'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Recall-Initiation-Date'), bold: true, alignment: "center" });
      data[0].push({ text: this.i18nService.translate.instant('reprint-component.Recall-Completion-Date'), bold: true, alignment: "center" });
    }
    this.documentList.map(document => {
      const tempData = [
        { text: document.Controlled_Print, alignment: 'center', fontSize: 10 },
        { text: "Print", alignment: 'center', fontSize: 10 },
        { text: "All", alignment: 'center', fontSize: 10 },
        { text: document['#userId'].name, alignment: 'center', fontSize: 10 },
        { text: document['#recipient'].name, alignment: 'center', fontSize: 10 },
        { text: document['#printReason'], alignment: 'center', fontSize: 10 },
        { text: document['#profile'], alignment: 'center', fontSize: 10 },
        { text: this.reportsService.getReportDateWithTime(document['#printRequestDateTime']), alignment: 'center', fontSize: 10 },
        { text: document['#printStatus'], alignment: 'center', fontSize: 10 },
        { text: document.rePrintInfo ? document.rePrintInfo.length : '-', alignment: 'center', fontSize: 10 },
      ];
      if (this.printType === commonConstant.PrintTypes.IP) {
        tempData.push({ text: document['#dueDate'] ? this.reportsService.getReportDateWithOutTime(document['#dueDate']) : '--', alignment: 'center', fontSize: 10 });
        tempData.push({ text: document.reconciliationInfo ? document.reconciliationInfo.outcome : '--', alignment: 'center', fontSize: 10 });
        tempData.push({ text: document.isOverdue ? 'Yes' : 'No', alignment: 'center', fontSize: 10 });
      } else {
        tempData.push({ text: document.recallInfo ? document.recallInfo.recallStatus : '--', alignment: 'center', fontSize: 10 });
        tempData.push({ text: document.recallInfo ? this.reportsService.getReportDateWithOutTime(document.recallInfo.recallInitiationDate) : '--', alignment: 'center', fontSize: 10 });
        tempData.push({ text: document.recallInfo ? this.reportsService.getReportDateWithOutTime(document.recallInfo.recallCompletionDate) : '--', alignment: 'center', fontSize: 10 });

      }
      data.push(tempData);
      if (document.rePrintInfo && document.rePrintInfo.length > 0) {
        document.rePrintInfo.map(reDocument => {
          const tempData1 = [
            { text: reDocument.controlled_copy, alignment: 'center', fontSize: 10 },
            { text: "Reprint", alignment: 'center', fontSize: 10 },
            { text: reDocument["#pages"], alignment: 'center', fontSize: 10 },
            { text: reDocument['#userId'].name, alignment: 'center', fontSize: 10 },
            { text: reDocument['#recipient'].name, alignment: 'center', fontSize: 10 },
            { text: reDocument['#printReason'], alignment: 'center', fontSize: 10 },
            { text: reDocument['#profile'], alignment: 'center', fontSize: 10 },
            { text: this.reportsService.getReportDateWithTime(reDocument['#printRequestDateTime']), alignment: 'center', fontSize: 10 },
            { text: reDocument['#printStatus'], alignment: 'center', fontSize: 10 },
            { text: '-', alignment: 'center', fontSize: 10 },
          ];
          if (this.printType === commonConstant.PrintTypes.IP) {
            tempData1.push({ text: document['#dueDate'] ? this.reportsService.getReportDateWithOutTime(document['#dueDate']) : '--', alignment: 'center', fontSize: 10 });
            tempData1.push({ text: document.reconciliationInfo ? document.reconciliationInfo.outcome : '--', alignment: 'center', fontSize: 10 });
            tempData1.push({ text: document.isOverdue ? 'Yes' : 'No', alignment: 'center', fontSize: 10 });
          } else {
            tempData1.push({ text: document.recallInfo ? document.recallInfo.recallStatus : '--', alignment: 'center', fontSize: 10 });
            tempData1.push({ text: document.recallInfo ? this.reportsService.getReportDateWithOutTime(document.recallInfo.recallInitiationDate) : '--', alignment: 'center', fontSize: 10 });
            tempData1.push({ text: document.recallInfo ? this.reportsService.getReportDateWithOutTime(document.recallInfo.recallCompletionDate) : '--', alignment: 'center', fontSize: 10 });
          }
          data.push(tempData1)
        });
      }

    });
    return data;
  }

  private getColumnWidthForPdfExport(): string[] {
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
      'auto',
      'auto',
      'auto'
    ];
    return data;
  }

  public getXlsxObject(data, type): any {
    let returnData = {};
    if (this.printType === commonConstant.PrintTypes.IP) {
      if (type === 'Print') {
        returnData[this.i18nService.translate.instant('reprint-component.Issued-Print-Number')] = data.Controlled_Print;
      } else {
        returnData[this.i18nService.translate.instant('reprint-component.Issued-Print-Number')] = data['#printCopyNo'];
      }
    } else {
      if (type === 'Print') {
        returnData[this.i18nService.translate.instant('reprint-component.Controlled-Print-Number')] = data.Controlled_Print;
      } else {
        returnData[this.i18nService.translate.instant('reprint-component.Controlled-Print-Number')] = data['#printCopyNo'];
      }
    }
    returnData[this.i18nService.translate.instant('reprint-component.Type')] = type;
    returnData[this.i18nService.translate.instant('reprint-component.Reprint-Page')] = type === 'Print' ? 'All' : data["#pages"];
    returnData[this.i18nService.translate.instant('reprint-component.Print-Owner')] = data["#userId"].name;
    returnData[this.i18nService.translate.instant('reprint-component.Recipient')] = data["#recipient"].name;
    returnData[this.i18nService.translate.instant('reprint-component.Reason')] = data["#printReason"];
    returnData[this.i18nService.translate.instant('reprint-component.Profile')] = data["#profile"];
    returnData[this.i18nService.translate.instant('reprint-component.Print-Date')] = this.reportsService.getReportDateWithTime(data["#printRequestDateTime"]);
    returnData[this.i18nService.translate.instant('reprint-component.Print-Status')] = data["#printStatus"];
    returnData[this.i18nService.translate.instant('reprint-component.Reprint-Count')] = type === 'Print' ? data.rePrintInfo ? data.rePrintInfo.length : '0' : 'N/A';

    if (this.printType === commonConstant.PrintTypes.IP) {
      returnData[this.i18nService.translate.instant('reprint-component.Reconciliation-Due-Date')] = data['#dueDate'] ? this.reportsService.getReportDateWithOutTime(data['#dueDate']) : '--';
      returnData[this.i18nService.translate.instant('reprint-component.Reconciliation-Status')] = data.reconciliationInfo ? data.reconciliationInfo.outcome : '--';
      returnData[this.i18nService.translate.instant('reprint-component.Reconciliation-Overdue')] = data.isOverdue ? 'Yes' : 'No';
    } else {
      returnData[this.i18nService.translate.instant('reprint-component.Recall-Status')] = data.recallInfo ? data.recallInfo.recallStatus : '--';
      returnData[this.i18nService.translate.instant('reprint-component.Recall-Initiation-Date')] = data.recallInfo ? this.reportsService.getReportDateWithOutTime(data.recallInfo.recallInitiationDate) : '--';
      returnData[this.i18nService.translate.instant('reprint-component.Recall-Completion-Date')] = data.recallInfo ? this.reportsService.getReportDateWithOutTime(data.recallInfo.recallCompletionDate) : '--';
    }
    return returnData;
  }

  public downloadReport(): void {
    const workBook = XLSX.utils.book_new();
    const data = [];
    this.documentList.map((item: any) => {
      const pObj = this.getXlsxObject(item, 'Print');
      data.push(pObj);
      if (item && item.rePrintInfo && item.rePrintInfo.length) {
        item.rePrintInfo.map((element: any) => {
          const pObj1 = this.getXlsxObject(element, 'Reprint');
          data.push(pObj1);
        });
      }
    });
    const workSheet = XLSX.utils.json_to_sheet(data);
    workSheet['A1'].cellStyles = { fill: { bgColor: { rgb: "black" } } };
    XLSX.utils.book_append_sheet(workBook, workSheet, 'data');
    XLSX.writeFile(workBook, 'report.xlsx');
  }

  public handlePageEvent(event: PageEvent): void {
    this.paginatorKeys.pageIndex = event.pageIndex;
    this.applyFilter();
  }

  public pad(num, size): string {
    var s = "00" + num;
    return s.substr(s.length - size);
  }

  public showNoteToggle(): void {
    this.showNote = !this.showNote;
  }

  private getProfileList(type: string): void {
    const profileListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result && result.status === 'success') {
          this.profileList = result.payload;
        }
      },
      error: (error) => {

      },
      complete: () => {

      }
    };
    this.printService.getProfileList({ "applicableFor": type }).subscribe(profileListObserver);
  }

  private getPages(pageString: string, maxPages: number, pagesToPrint?: string[]): any {
    let pagesToSend = [];
    if (pageString.length > 0) {
      const pageStr = pageString.trim();
      if (pageStr === '0') {
        return { 'error': false, pages: [0] }
      } else if (pageStr) {
        const masterArray: any = pageStr.split(',');
        if (masterArray.length) {
          for (let i = 0; i < masterArray.length; i++) {
            if (/-/.test(masterArray[i])) {
              const range = masterArray[i].split('-').map(x => +x);
              const sorted = range.sort();
              if (sorted[0] <= 0) {
                this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-should-be-more-than-0'));
                return { 'error': true, pages: [] };
              }
              let pointer = sorted[0];
              do {
                if (Number(pointer) > 0) {
                  pagesToSend.push(Number(pointer));
                } else {
                  this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-should-be-more-than-0'));
                  return { 'error': true, pages: [] };
                }
                pointer = pointer + 1;
              } while (pointer <= sorted[1]);
            } else {
              if (+masterArray[i] > 0) {
                pagesToSend.push(+masterArray[i]);
              } else {
                this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-should-be-more-than-0'));
                return { 'error': true, pages: [] };
              }
            }
          }
        } else {
          this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-should-be-more-than-0'));
          return { 'error': true, pages: [] };
        }
      }
      if (pagesToSend.length) {
        pagesToSend = pagesToSend.map(x => x - 1).sort().filter(function (el, i, a) { return i === a.indexOf(el) }).map(y => y + '');
        if (pagesToPrint) {
          return { 'error': false, pages: pagesToSend }
        } else if (Number(Math.max(...pagesToSend) + 1) >
          Number(maxPages)) {
          this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-are-more-than-Pages-Available'));
          return { 'error': true, pages: [] };
        } else {
          return { 'error': false, pages: pagesToSend }
        }
      } else {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-should-valid-Numbers'));
        return { 'error': true, pages: [] };
      }
    }
  }

  public setOutcome(index): void {
    const doc = this.reconciliationDocs[index];
    const totalPages = doc.type === 'Print' ? doc["#pageCount"] : doc["#pagesToPrint"].length;
    const returnedPages = this.getPages(doc.reconciliationInfo.printReturned, totalPages, doc["#pagesToPrint"]);
    if (returnedPages.error) {
      this.reconciliationDocs[index].pageError = true;
      this.reconciliationDocs[index].reconciliationInfo.printReturned = '';
      this.reconciliationDocs[index].reconciliationInfo.outcome = '';
    } else if (returnedPages.pages.length === 1 && returnedPages.pages[0] === 0) {
      this.reconciliationDocs[index].reconciliationInfo.outcome = 'Incomplete Recovery';
    } else {
      if (doc["#pagesToPrint"]) {
        const errorPages = returnedPages.pages.filter(n => !doc["#pagesToPrint"].includes(+n + 1 + ''));
        if (errorPages.length) {
          this.toast.error(this.i18nService.translate.instant('reprint-component.Pages-to-print-are-more-than-Pages-Available'));
          this.reconciliationDocs[index].pageError = true;
          this.reconciliationDocs[index].reconciliationInfo.printReturned = '';
          this.reconciliationDocs[index].reconciliationInfo.outcome = '';
        } else {
          if (totalPages === returnedPages.pages.length && returnedPages.pages[0] !== 0) {
            this.reconciliationDocs[index].reconciliationInfo.outcome = 'Complete';
          } else {
            this.reconciliationDocs[index].reconciliationInfo.outcome = 'Incomplete Recovery';
          }
        }
      } else {
        if (totalPages === returnedPages.pages.length && returnedPages.pages[0] !== 0) {
          this.reconciliationDocs[index].reconciliationInfo.outcome = 'Complete';
        } else {
          this.reconciliationDocs[index].reconciliationInfo.outcome = 'Incomplete Recovery';
        }
      }
    }
  }

  public ngOnInit(): void {
    this.getRecipientData();
    this.documentService.documentInfo.subscribe((res: any) => {
      this.documentInfo = res;
    });
    this.documentService.printType.subscribe(printType => {
      if (printType) {
        this.printType = printType;
        if (this.printType === commonConstant.PrintTypes.IP) {
          this.getReconciliationReasons();
          this.displayedColumns.splice(9, 0, "Reconciliation");
          ['Reconciliation_Due_Date', 'Reconciliation_Status', 'Reconciliation_Overdue'].map(col => this.displayedColumns.push(col));
        } else {
          this.getRecallReasons();
          this.displayedColumns.splice(8, 0, "Recall");
          ['Recall_Status', 'Recall_Initiation_Date', 'Recall_Completion_Date'].map(col => this.displayedColumns.push(col));
        }
        this.documentService.reprintDashboardType.subscribe(type => {
          if (type) {
            this.reprintDashboardType = type;
            this.displayedColumns = this.displayedColumns.filter(col => col !== 'Actions');
          } else {
            this.reprintDashboardType = undefined;
          }
          this.getDocumentList({ 'type': printType, 'reprintDashboardType': this.reprintDashboardType });
        });
        this.getProfileList(this.printType);
      }
    });

  }

  public rePrint(doc): void {
    this.documentService.setDocumentInfo(doc);
    this.router.navigate(['print']);
  }

  public reCall(): void {
    this.showPopup = true;
    this.recallReason = '';
    this.recallReasons = of(this.recallReasonsMaster);
  }

  public closePopup(): void {
    this.showPopup = false;
  }

  public sendReconciliationReq(): void {
    const req: any = this.reconciliationDocs;
    const saveRecallInfoObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.toast.success(this.i18nService.translate.instant('reprint-component.Reconciliation-docs-Partially-Reconciled'));
          this.getDocumentList({ type: this.printType, 'reprintDashboardType': this.reprintDashboardType });
          this.loader = false;
        } else {
          this.loader = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Document-List'));
        this.loader = false;
      },
      complete: () => {
        this.closePopup();
        this.selection.clear();
      }
    };
    req.type = this.printType;
    this.loader = true;
    this.recallService.saveReconciliation(req).subscribe(saveRecallInfoObserver);
  }

  public sendRecallDocReq(): void {
    const req: any = { _id: this.getSelected() };
    const saveRecallInfoObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.toast.success(this.i18nService.translate.instant('reprint-component.Recall-docs-successfully'));
          this.getDocumentList({ type: this.printType, 'reprintDashboardType': this.reprintDashboardType });
          this.loader = false;
        } else {
          this.loader = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Document-List'));
        this.loader = false;
      },
      complete: () => {
        this.recallReason = '';
        this.closePopup();
        this.selection.clear();
      }
    };
    req.type = this.printType;
    req.recallInfo = {
      recallReason: this.recallReason
    }
    this.loader = true;
    this.recallService.saveRecall(req).subscribe(saveRecallInfoObserver);
  }

  public reconciliation(): void {
    this.reconciliationDocs = this.getSelectedReconcile();
    this.showPopup = true;
  }

  public applyFilter(): any {
    this.loader = true;
    let reqObj = {
      type: this.printType,
      reprintDashboardType: this.reprintDashboardType,
      userId: this.filterConstant.printOwner,
      infocardNumber: this.documentInfo.infocardNumber ?
        this.documentInfo.infocardNumber : null,
      printStartDate: this.filterConstant.startDate ?
        this.getUTCDate(this.filterConstant.startDate) : null,
      printEndDate: this.filterConstant.endDate ?
        this.getUTCDate(this.filterConstant.endDate) : null,
      recipient: this.filterConstant.recipient,
      printStatus: this.filterConstant.printStatus,
      pageNumber: this.paginatorKeys.pageIndex,
      pageSize: this.paginatorKeys.pageSize,
      documentName: this.filterConstant.documentName,
      revision: this.filterConstant.revision,
      printNumber: this.filterConstant.printNumber,
      reconciliationDueDate: this.filterConstant.reconciliationDueDate ?
        this.getUTCDate(this.filterConstant.reconciliationDueDate) : null,
      reconciliationStatus: this.filterConstant.reconciliationStatus,
      isOverdue: this.filterConstant.overdue,
      recallStatus: this.filterConstant.recallStatus,
      profile: this.filterConstant.profile
    };
    reqObj = JSON.parse(JSON.stringify(reqObj), (key, value) => {
      if (value == null || value === '' || value === [] || value === {}) {
        return undefined;
      }
      return value;
    });
    this.getDocumentList(reqObj);
  }

  public getUTCDate(date: Date): String {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1, 2)}-${date.getDate()}`;
  }

  public clearFilter(): any {
    this.filterConstant = JSON.parse(JSON.stringify(FilterConstant));
    this.printOwnerList = of(this.printOwnerListMaster);
    this.controlledPrintList = of(this.controlledPrintListMaster);
    this.recipients = of(this.recipientsMaster);
    this.getDocumentList({ 'type': this.printType, 'reprintDashboardType': this.reprintDashboardType });
  }

  public getDocumentList(req: any): void {
    const getDocumentListObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          const temp = result.payload;
          this.documentList = this.setDocumentList(temp);
          this.paginatorKeys.count = result.count;
          this.loader = false;
        } else {
          this.loader = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Document-List'));
        this.loader = false;
      },
      complete: () => {

      }
    };
    req.type = this.printType;
    req.pageNumber = this.paginatorKeys.pageIndex;
    req.pageSize = this.paginatorKeys.pageSize;
    this.printService.getDocumentList(req).subscribe(getDocumentListObserver);
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
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Document-List'));
        this.loader = false;
      },
      complete: () => {

      }
    };
    this.printService.getInternalRecipient().subscribe(getRecipientObserver);
  }

  private getReconciliationReasons(): void {
    const getReconciliationReasonsObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.loader = false;
        if (result.status === 'success') {
          this.reconciliationReasons = of(result.payload);
          this.reconciliationReasonsMaster = result.payload;
        } else {
          this.reconciliationReasons = of([]);
          this.reconciliationReasonsMaster = [];
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Outcome-Status-List'));
        this.loader = false;
      },
      complete: () => {
        this.getOutcomeStatus();
      }
    };
    this.loader = true;
    this.printService.getReconciliationReasons().subscribe(getReconciliationReasonsObserver);
  }

  private getOutcomeStatus(): void {
    const getOutcomeStatusObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.loader = false;
        if (result.status === 'success') {
          this.outcomeStatusList = result.payload;
        } else {
          this.outcomeStatusList = [];
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Outcome-Status-List'));
        this.loader = false;
      },
      complete: () => {
      }
    };
    this.loader = true;
    this.printService.getOutcomeStatus().subscribe(getOutcomeStatusObserver);
  }

  private getRecallReasons(): void {
    const getRecallReasonObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.loader = false;
        if (result.status === 'success') {
          this.recallReasonsMaster = result.payload;
        } else {
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-getting-Recall-Reason-List'));
        this.loader = false;
      },
      complete: () => {

      }
    };
    this.printService.getRecallReasons().subscribe(getRecallReasonObserver);
  }

  public setDocumentList(temp: any): any {
    if (temp && temp.length) {
      const controlledPrintList: SelectOption[] = [];
      temp.map(t => {
        t.Controlled_Print = t["#type"] + '-' + t["@infocardNumber"] + '-' + t["@revision"] + '-' + t["#printNo"];
        let ip = '';
        t.profileFields.filter(f => f.show).map(i => {
          ip = ip + `${i.name} : ${i.value}`;
        });
        t.userInput = ip;
        controlledPrintList.push({ label: t.Controlled_Print, value: t.Controlled_Print });
        t.rePrintInfo.map(rt => {
          rt['#pagesToPrint'] = rt['#pagesToPrint'].map(page => Number(page) + 1).map(ps => ps + '');
          let ip = '';
          rt.profileFields.filter(f => f.show).map(i => {
            ip = ip + `${i.name} : ${i.value}`;
          });
          rt.userInput = ip;
        });
        return t;
      });
      this.controlledPrintListMaster = [...new Map(controlledPrintList.map(item =>
        [item['value'], item])).values()];
      this.controlledPrintList = of(this.controlledPrintListMaster);
      return temp;
    } else {
      return [];
    }
  }

  public doFilter(): void {
    if (this.recallReasonsMaster) {
      this.recallReasons = of(this.recallReasonsMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.recallReason) === 0) {
          return mas;
        }
      }));
    }
    if (!this.recallReasons) {
      this.recallReasons = of([]);
    }
  }

  public filterPrintOwnerList(): void {
    if (this.printOwnerListMaster) {
      this.printOwnerList = of(this.printOwnerListMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.filterConstant.printOwner.toLowerCase()) === 0) {
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
        if (mas.value.toLowerCase().indexOf(this.filterConstant.recipient.toLowerCase()) === 0) {
          return mas;
        }
      }));
    }
    if (!this.recipients) {
      this.recipients = of([]);
    }
  }


  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.documentList.filter(row => {
      if (row['#printStatus'] === 'Successful') {
        if (this.printType === commonConstant.PrintTypes.CP) {
          if (row.recallInfo) {
            if (!row.recallInfo.recallStatus) {
              return row;
            }
          } else {
            return row;
          }
        } else if (this.printType === commonConstant.PrintTypes.IP) {
          if (row.reconciliationInfo) {
            if (!row.reconciliationInfo.status) {
              return row;
            }
          } else {
            return row;
          }
        }
      }
    }).length;
    return numSelected == numRows;
  }

  private getSelected(): any[] {
    const ret = [];
    this.documentList.map(doc => {
      if (this.selection.isSelected(doc)) {
        ret.push(doc._id);
      }
    });
    return ret;
  }

  private getSelectedReconcile(): any[] {
    const ret = [];
    this.documentList.map(doc => {
      if (this.selection.isSelected(doc)) {
        const docRe = JSON.parse(JSON.stringify(doc));
        docRe.reconciliationInfo = {};
        docRe.type = "Print";
        ret.push(docRe);
        if (docRe.rePrintInfo) {
          docRe.rePrintInfo.map(rePrintDoc => {
            if (rePrintDoc['#printStatus'] === 'Successful') {
              const docRe = JSON.parse(JSON.stringify(rePrintDoc));
              docRe.reconciliationInfo = {};
              docRe.type = "Reprint";
              docRe._id = doc._id;
              ret.push(docRe);
            }
          });
        }
      }
    });
    return ret;
  }
  public setReconciliationDisabled(doc): boolean {
    if (this.getSelectedReconcile().length >= 5 && !this.selection.isSelected(doc)) {
      this.toast.info(this.i18nService.translate.instant('reprint-component.Max-limit-reached-Please-reconcile-Selected'))
      return false;
    } else {
      return true;
    }

  }

  public masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.documentList.forEach(row => {
        if (row['#printStatus'] === 'Successful') {
          if (this.printType === commonConstant.PrintTypes.CP) {
            if (row.recallInfo) {
              if (!row.recallInfo.recallStatus) {
                this.selection.select(row)
              }
            } else {
              this.selection.select(row);
            }
          } else if (this.printType === commonConstant.PrintTypes.IP) {
            if (row.reconciliationInfo) {
              if (!row.reconciliationInfo.status) {
                this.selection.select(row)
              }
            } else {
              this.selection.select(row);
            }
          }
        }
      });
  }

  public openUpdateOverdue(doc): void {
    if ((doc.reconciliationInfo && doc.reconciliationInfo.outcome) || doc['#printStatus'] !== 'Successful') {
      return;
    } else {
      this.document = doc;
      if (doc['#dueDate']) {
        this.document.dueDate = new Date(doc['#dueDate']);
      }
      this.overDueReason = '';
      this.newDueDate = null;
      this.updateDueDate = true;
    }
  }

  public updateDueDateFun(): void {
    const updateDueDateObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.loader = false;
        if (result.status === 'success') {
          this.toast.success(this.i18nService.translate.instant('reprint-component.Updated-successful'));
          this.getDocumentList({ type: this.printType });
          this.loader = false;
        } else {
          this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-update-due-date'));
          this.loader = false;
        }
      },
      error: () => {
        this.toast.error(this.i18nService.translate.instant('reprint-component.Error-in-update-due-date'));
        this.loader = false;
      },
      complete: () => {
        this.updateDueDate = false;
      }
    };
    this.loader = true;
    const req = {
      _id: this.document._id,
      newDueDate: this.getUTCDate(this.newDueDate),
      newDueDateReason: this.overDueReason,
      dueDate: this.document['#dueDate'],
      dueDateReason: this.document['#dueDateReason']

    }
    this.recallService.updateDueDate(req).subscribe(updateDueDateObserver);
  }
  public closeUpdateDueDate(): void {
    this.updateDueDate = false;
  }

  public filterReconciliationReasons(): void {
    if (this.reconciliationReasonsMaster) {
      this.reconciliationReasons = of(this.reconciliationReasonsMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.overDueReason.toLowerCase()) === 0) {
          return mas;
        }
      }));
    }
    if (!this.reconciliationReasons) {
      this.reconciliationReasons = of([]);
    }
  }
}
