import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor() { }

  public document = new BehaviorSubject(undefined);
  public printType = new BehaviorSubject(undefined);
  public documentInfo = new BehaviorSubject(undefined);
  public reprintDashboardType = new BehaviorSubject(undefined);

  public setDocument(data: any) {
    this.document.next(data);
  }

  public setDocumentInfo(data: any) {
    this.documentInfo.next(data);
  }

  public setPrintType(data: any) {
    this.printType.next(data);
  }

  public setReprintDashboardType(isRecall, isReconciliation) {
    if (isRecall) {
      this.reprintDashboardType.next('Recall');
    } else if (isReconciliation) {
      this.reprintDashboardType.next('Reconciliation');
    }
  }
}