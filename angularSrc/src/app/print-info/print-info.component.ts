import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PrintService } from '../http-services/print.service';
import { PartialObserver } from 'rxjs/internal/types';
import { HttpErrorResponse } from '@angular/common/http';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { of, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SocketService } from '../service/socket.service';
import { Router } from '@angular/router';
import { DocumentService } from '../service/document.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../service/user.service';
import * as _ from 'lodash';
import { commonConstant } from '../constants/common';
import { DateService } from '../service/date.service';
import { I18nService } from '../service/i18n.service';
@Component({
  selector: 'app-print-info',
  templateUrl: './print-info.component.html',
  styleUrls: ['./print-info.component.scss']
})
export class PrintInfoComponent implements OnInit, OnDestroy {
  public isLoading: boolean;
  public printProfile: any[] = [];
  public internalRecipientMaster: any[] = [];
  public reasonForPrint: any;
  public reasonForPrintMaster: any;
  public selectedPrinter: any;
  public profileFields: any[];
  public profile: any;
  public profileFieldsName: any;
  public recipients: string[] = [];
  public externalRecipients: string[] = [];
  public externalRecipientMaster: any[] = [];
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public fruitCtrl = new FormControl();
  public externalRecpt = new FormControl();
  public visible = true;
  public selectable = true;
  public removable = true;
  public printerList: any = [];
  public ReasonForPrinting: any;
  public NoOfPrinting: number;
  public internalRecipient: Observable<any[]>;
  public externalRecipient: Observable<any[]>;
  public recipient: any;
  public isUpdate: boolean;
  public profileId: string;
  public showPopup: boolean = false;
  public dueDate: any = null;
  public pages: string;
  public documentInfo: any;
  public user: any;
  public userIp1: any;
  public verifyRecipientData: any[];
  @ViewChild('fruitInput', { static: false }) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('externalRec', { static: false }) externalRec: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  public printType: any;
  public showNote: boolean;
  public todayDate: Date = new Date();
  public subscriptionGroup: Subscription[] = [];
  public batchNumber: string;
  public isBatchNumberApplicable: boolean;
  constructor(
    private toast: ToastrService,
    private printService: PrintService,
    private dateService: DateService,
    private documentService: DocumentService,
    private router: Router,
    private userService: UserService,
    private socketService: SocketService,
    private i18nService: I18nService
  ) {
    this.internalRecipient = this.fruitCtrl.valueChanges.pipe(
      startWith(''),
      map((recipient: string | null) => recipient ? this._filter(recipient) : this.internalRecipientMaster.slice()));

    this.externalRecipient = this.externalRecpt.valueChanges.pipe(
      startWith(''),
      map(
        (externalRecipient: string | null) => externalRecipient ? this._filter1(externalRecipient) : this.externalRecipientMaster.slice()));

    this.subscriptionGroup.push(this.documentService.printType.subscribe(printType => {
      if (printType) {
        this.printType = printType;
        if (this.documentInfo) {
          this.getPrintProfileData(this.printType, this.documentInfo['@parentInfocardTypeName'], null);
        }
      }
    }));
    this.subscriptionGroup.push(this.userService.user.subscribe(userData => {
      if (userData) {
        this.user = userData;
      }
    }));
    this.subscriptionGroup.push(this.socketService.printerList.subscribe(printer => {
      if (printer && printer.length) {
        this.printerList = printer;
      }
    }));
    this.subscriptionGroup.push(this.documentService.documentInfo.subscribe((result: any) => {
      if (result) {
        this.documentInfo = result;
        this.ReasonForPrinting = result["#printReason"] ? result["#printReason"] : null;
        this.recipient = result["#recipient"] ? result["#recipient"] : null;
        this.isUpdate = result["#recipient"] ? true : false;
        this.getPrintProfileData(this.printType, this.documentInfo['@parentInfocardTypeName'], result["#profile"]);
      }
    }));
  }
  ngOnDestroy(): void {
    this.subscriptionGroup.forEach(subscription => {
      subscription.unsubscribe()
    });
  }

  getPrintProfileData(printType: any, documentTypeName: string, profileName?: string) {
    const getPrintProfileObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        this.isLoading = false;
        if (result.status === 'success' && result.payload && result.payload.length > 0) {
          this.printProfile = result.payload;
          if (profileName) {
            const profile = this.printProfile.filter(pro => pro.name === profileName)[0];
            this.profile = profile.name;
            this.profileFields = this.documentInfo.profileFields;
            if(profile.isBatchNumberApplicable){
              this.isBatchNumberApplicable = true;
              this.batchNumber = this.documentInfo["#batchNumber"];
            }
          }
        } else {
          this.toast.error(this.i18nService.translate.instant('print-info-component.profiles-not-found'));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
      },
      complete: () => {
        this.getPrintReasonData();
      }
    };
    if (printType && documentTypeName) {
      this.isLoading = true;
      this.printService.getPrintProfile({ printType: printType, isReprint: this.isUpdate, documentTypeName: documentTypeName }).subscribe(getPrintProfileObserver);
    }
  }

  getRecipientData() {
    const getRecipientObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.internalRecipientMaster = result.payload;
        } else {
        }
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {

      }
    };
    this.printService.getInternalRecipient().subscribe(getRecipientObserver);
  }
  getExternalRecipientData() {
    const getExtRecipientObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.externalRecipientMaster = result.payload;
        } else {
        }
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {

      }
    };
    this.printService.getExternalRecipient().subscribe(getExtRecipientObserver);
  }

  getPrintReasonData() {
    const getPrintReasonObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.reasonForPrint = of(result.payload);
          this.reasonForPrintMaster = result.payload;
        } 
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    };
    this.isLoading = true;
    this.printService.getReasonForPrinting(this.isUpdate).subscribe(getPrintReasonObserver);
  }

  ngOnInit() {
    this.verifyRecipientData = [];
    this.profile = '';
    this.selectedPrinter = '';
    this.ReasonForPrinting = '';
    this.NoOfPrinting = 1;
    this.profileFields = [];
    this.userIp1 = '';
    this.batchNumber ="";
    this.getRecipientData();
    this.getExternalRecipientData();
  }


  onOptionsSelected() {
    const profile =  this.printProfile.filter(ir => {
      if (ir.name === this.profile) {
        this.profileId = ir._id;
        return ir;
      }
    })[0];
    this.isBatchNumberApplicable = profile.isBatchNumberApplicable;
    this.profileFields = profile.userInputFields;
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if (this.internalRecipientMaster.includes(value)) {
      this.recipients.push(value.trim());
    }
    if (input) {
      input.value = '';
    }

    this.fruitCtrl.setValue(null);
  }
  add1(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      if (this.externalRecipients.indexOf(value.trim()) === -1) {
        this.externalRecipients.push(value.trim());
      }
    }
    if (input) {
      input.value = '';
    }

    this.externalRecpt.setValue(null);
  }
  remove(recipient: string): void {
    const index = this.recipients.indexOf(recipient);

    if (index >= 0) {
      this.recipients.splice(index, 1);
    }
  }
  remove1(externalRecipient: string): void {
    const index = this.externalRecipients.indexOf(externalRecipient);

    if (index >= 0) {
      this.externalRecipients.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.recipients.includes(event.option.viewValue)) {
      this.recipients.push(event.option.viewValue);
    }
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }
  selected1(event: MatAutocompleteSelectedEvent): void {
    if (this.externalRecipients.indexOf(event.option.viewValue) === -1) {
      this.externalRecipients.push(event.option.viewValue);
    }
    this.externalRec.nativeElement.value = '';
    this.externalRecpt.setValue(null);
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.internalRecipientMaster.filter(recipient => recipient.label.toLowerCase().indexOf(filterValue) === 0);
  }
  private _filter1(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.externalRecipientMaster.filter(externalRecipient => externalRecipient.label.toLowerCase().indexOf(filterValue) === 0);
  }

  public doFilter() {
    if (this.reasonForPrintMaster) {
      this.reasonForPrint = of(this.reasonForPrintMaster.filter(mas => {
        if (mas.value.toLowerCase().indexOf(this.ReasonForPrinting) === 0) {
          return mas;
        }
      }));
    }
    if (!this.reasonForPrint) {
      this.reasonForPrint = of([]);
    }
  }
  public print(): void {
    if (this.isUpdate) {
      this.rePrintDocument();
    } else {
      this.printDocument();
    }
  }

  public rePrintDocument(): void {
    const rePrintObservable: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          const docId = [];
          if (result.payload) {
            docId.push(this.documentInfo._id);
          }
          this.socketService.rePrint(docId, this.selectedPrinter, result.payload.controlled_copy);
        } else {
          this.toast.error(this.i18nService.translate.instant('print-info-component.Error-in-Overlay'));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(this.i18nService.translate.instant('print-info-component.Error-occurred-while-printing'));
      },
      complete: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    };
    let pagesToSend = [];
    if (this.pages && Number(this.pages) != 0) {
      const masterArray: any = this.pages.split(',');
      if (masterArray.length) {
        for (let i = 0; i < masterArray.length; i++) {
          if (/-/.test(masterArray[i])) {
            const range = masterArray[i].split('-').map(x => +x);
            const sorted = range.sort();
            if (sorted[0] < 1) {
              this.toast.error(this.i18nService.translate.instant('print-info-component.Pages-to-print-should-be-more-than-0'));
              return;
            }
            let pointer = sorted[0];
            do {
              pagesToSend.push(Number(pointer));
              pointer = pointer + 1;
            } while (pointer <= sorted[1]);
          } else {
            pagesToSend.push(+masterArray[i]);
          }
        }
      }
    } else if (this.pages && Number(this.pages) < 1) {
      this.toast.error(this.i18nService.translate.instant('print-info-component.Pages-to-print-should-be-more-than-0'));
      return;
    }
    if (pagesToSend.length) {
      pagesToSend = pagesToSend.map(x => x - 1).sort().filter(function (el, i, a) { return i === a.indexOf(el) }).map(y => y + '');
      if (Number(Math.max(...pagesToSend) + 1) >
        Number(this.documentInfo["#pageCount"])) {
        this.toast.error(this.i18nService.translate.instant('print-info-component.Pages-to-print-are-more-than-Pages-Available'));
        return;
      }
    } else {
      this.toast.error(this.i18nService.translate.instant('print-info-component.Pages-to-print-should-valid-Numbers'));
      return;
    }
    const data = {
      ...this.documentInfo,
      '#printer': this.selectedPrinter,
      '#printReason': this.ReasonForPrinting,
      '#pagesToPrint': pagesToSend,
      '#pages': this.pages,
      '#profile': this.profile,
      '#type': this.printType,
      '#batchNumber': this.batchNumber,
      "profileFields": this.profileFields.filter(field => {
        if (field && (field.key || field.name)) {
          return field;
        }
      })
    };
    delete data["#ext_print_recipient"];
    delete data["#externalRecipient"];
    delete data["formFields"];
    delete data["userInput"];
    delete data["rePrintInfo"];
    this.isLoading = true;
    this.printService.rePrintDocument(data).subscribe(rePrintObservable);
  }

  public sendPrintReq(): any {
    const req = this.getRequestObj();
    this.printService.printDocument(req).subscribe(res => {
      this.isLoading = false;
      if (res.status === 'success') {
        const docIds = [];
        res.payload.map(data => {
          if (data.overlayStatus === 'success') {
            docIds.push(data._id);
          }
        });
        if (docIds.length) {
          this.socketService.print(docIds, this.selectedPrinter);
        } else {
          this.toast.error(this.i18nService.translate.instant('print-info-component.Error-in-Overlay'));
        }
        this.router.navigate(['/']);
      } else {
        this.toast.error(this.i18nService.translate.instant('print-info-component.Error-in-Overlay'));
      }
    }, (error) => {
      this.toast.error(this.i18nService.translate.instant('print-info-component.Document-Not-Found'));
      this.isLoading = false;
    });
  }


  public printDocument(): void {
    if (!this.recipients && !this.externalRecipients) {
      this.toast.error(this.i18nService.translate.instant('print-info-component.Please-add-atleast-1-recipient'));
      return;
    }
    this.isLoading = true;
    const req = this.getRequestObj();
    this.printService.verifyPrintRecipient(req).subscribe((responseData: any) => {
      if (responseData && responseData.payload) {
        // this.intExtRecipientMaster = [];
        this.verifyRecipientData = [...responseData.payload];
        this.verifyRecipientData = _.uniqWith(this.verifyRecipientData, _.isEqual);
        //  this.intExtRecipientMaster = [...this.recipients, ...this.externalRecipients];
        this.isLoading = false;
        this.showPopup = true;
      } else {
        this.sendPrintReq();
      }
    }, (error) => {
      this.isLoading = false;
    });
  }

  public getRequestObj(): Object {
    const recipients = [];
    if (this.recipients) {
      this.recipients.map(re => {
        const res = this.internalRecipientMaster.filter(mre => mre.value === re)[0];
        recipients.push({ name: re, userName: res.userName });
      });
    }
    const exRecipients = [];
    if (this.externalRecipients) {
      this.externalRecipients.map(re => {
        exRecipients.push({ name: re, userName: this.user.userName });
      });
    }
    const data = {
      '#printer': this.selectedPrinter,
      '#int_print_recipient': this.recipients.length + '',
      '#ext_print_recipient': this.externalRecipients.length + '',
      '#printReason': this.ReasonForPrinting,
      '#userId': { name: this.user.formattedName, userName: this.user.userName },
      '#type': this.printType,
      '#profile': this.profile,
      '#internalRecipient': recipients,
      '#externalRecipient': exRecipients,
      "noOfPrint": this.NoOfPrinting,
      '#batchNumber': this.batchNumber,
      "profileFields": this.profileFields.filter(field => {
        if (field && (field.key || field.name)) {
          return field;
        }
      }),
      "profileId": this.profileId
    };
    if (this.printType === commonConstant.PrintTypes.IP) {
      data["#dueDate"] = this.dueDate ? this.dateService.getDateString(this.dueDate) : null;
    }

    return Object.assign(data, this.documentInfo);
  }

  public showNoteToggle() {
    this.showNote = !this.showNote;
  }
}

