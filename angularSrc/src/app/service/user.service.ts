import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  public user = new BehaviorSubject(undefined);
  public userRole = new BehaviorSubject(undefined);

  public setUser(data: any) {
    if (data && data.roles) {
      this.setUserRole(data.roles);
    }
    this.user.next(data);
  }

  private setUserRole(roles) {
    const data = {
      ipPrint: false,
      ipReprint: false,
      ipAudit: false,
      reconciliation: false,
      cpPrint: false,
      cpReprint: false,
      cpAudit: false,
      recall: false
    }
    Object.keys(roles).map(role => {
      if (roles[role]) {
        switch (role) {
          case 'imp_admin':
            data.ipPrint = true;
            data.ipReprint = true;
            data.ipAudit = true;
            data.reconciliation = true;
            data.cpPrint = true;
            data.cpReprint = true;
            data.cpAudit = true;
            data.recall = true;
            break;
          case 'imp_controlled_print_coordinator':
            data.cpPrint = true;
            data.cpReprint = true;
            data.cpAudit = true;
            data.recall = true;
            break;
          case 'imp_controlled_print_only':
            data.cpPrint = true;
            data.cpAudit = true;
            break;
          case 'imp_controlled_print_reprint':
            data.cpPrint = true;
            data.cpReprint = true;
            data.cpAudit = true;
            break;
          case 'imp_issued_print_coordinator':
            data.ipPrint = true;
            data.ipReprint = true;
            data.ipAudit = true;
            // data.reconciliation = true;
            break;
          case 'imp_issued_print_only':
            data.ipPrint = true;
            data.ipAudit = true;
            break;
          case 'imp_issued_print_reprint':
            data.ipPrint = true;
            data.ipReprint = true;
            data.ipAudit = true;
            break;
          case 'imp_reconciliation':
            data.reconciliation = true;
            data.ipAudit = true;
            break;
          case 'imp_recipient':
            data.cpAudit = true;
            data.ipAudit = true;
            break;
        }
      }
    });
    this.userRole.next(data);
  }
}
