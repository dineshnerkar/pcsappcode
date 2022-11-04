import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor(private readonly httpService: HttpService) { }

  public getPrintProfile(data): Observable<any> {
    return this.httpService.post('getPrintProfile', data);
  }

  public getProfileList(data): Observable<any> {
    return this.httpService.post('getProfileList', data);
  }

  public getReasonForPrinting(f: boolean): Observable<any> {
    return this.httpService.get(`getReasonForPrinting?type=${f ? 'reprint' : 'print'}`);
  }

  public getInternalRecipient(): Observable<any> {
    return this.httpService.get('getInternalRecipient');
  }

  public printDocument(data): Observable<any> {
    return this.httpService.post('print', data);
  }

  public rePrintDocument(data): Observable<any> {
    return this.httpService.post('reprint', data);
  }

  public updatePrintStatus(data): Observable<any> {
    return this.httpService.post('updatePrintStatus', data);
  }

  public getDocumentList(data): Observable<any> {
    return this.httpService.post('getDocumentList', data);
  }
  public getDocument(data: any): Observable<any> {
    return this.httpService.post('getDocumentInfo', data);
  }
  public getAuditData(data: any): Observable<any> {
    return this.httpService.post('getAuditData', data);
  }
  public getUserInfo(data: any): Observable<any> {
    return this.httpService.post('getUserInfo', data);
  }
  public verifyPrintRecipient(data: any): Observable<any> {
    return this.httpService.post('verifyPrintRecipient', data);
  }
  public getExternalRecipient(): Observable<any> {
    return this.httpService.get('getExternalRecipient');
  }
  public getRecallReasons(): Observable<any> {
    return this.httpService.get('getRecallReason');
  }
  public getRecallDocList(data): Observable<any> {
    return this.httpService.post('getRecallDocList', data);
  }
  public getNotificationList(data): Observable<any> {
    return this.httpService.post('getNotificationList', data);
  }

  public getNotificationCount(data: any): Observable<any> {
    return this.httpService.post('getNotificationCount', data);
  }

  public getReconciliationReasons(): Observable<any> {
    return this.httpService.get('getReconciliationReasons');
  }

  public getOutcomeStatus(): Observable<any> {
    return this.httpService.get('getOutcomeStatus');
  }

  public validatePrinterList(list: string[]): Observable<any> {
    return this.httpService.post('validatePrinterList', { printerList: list });
  }

  public login(data: any): Observable<any> {
    return this.httpService.post('login', data);
  }

}
