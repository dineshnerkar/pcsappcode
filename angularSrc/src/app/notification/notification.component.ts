import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PartialObserver } from 'rxjs';
import { PrintService } from '../http-services/print.service';
import { Notification } from '../models/notification';
import { HttpResponse } from '../models/httpResponse';
import { ToastrService } from 'ngx-toastr';
import { User } from '../models/user';
import { UserService } from '../service/user.service';
import { PaginatorKeys } from '../constants/filter';
import { RecallService } from '../http-services/recall.service';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  public loading = false;
  public notification: Notification;
  public notificationList: Notification[];
  public selectedIndex: number;
  public user: User;
  public recallList: any[];
  public displayedColumns = ['Controlled_Print', 'Reason', 'Status', 'Initiation_Date'];
  public recallComment: string;;
  public showPopup: boolean;

  constructor(private printService: PrintService,
    private recallService: RecallService,
    private userService: UserService,
    private toastr: ToastrService,
    private i18nService: I18nService) {
    this.loading = false;
    this.selectedIndex = 0;

    this.userService.user.subscribe((user) => {
      if (user) {
        this.user = user;
        this.getNotificationList();
      }
    })

  }

  ngOnInit() {

  }

  public setSelected(index: number): void {
    this.notification = new Notification();
    this.selectedIndex = index;
    this.notification = this.notificationList[index];
    this.setRecallList();
  }

  private getNotificationList(): void {

    const notificationListObservable: PartialObserver<HttpResponse | HttpErrorResponse> = {
      next: (result: HttpResponse) => {
        if (result.status === 'success') {
          this.notificationList = result.payload;
          this.notification = result.payload[0];
          this.setRecallList();
          this.selectedIndex = 0;
          this.loading = false;
        } else {
          this.loading = false;
          this.notification = undefined;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(this.i18nService.translate.instant('notification-components.Error-in-getting-Notification-List'));
        this.loading = false;
      },
      complete: () => {

      }
    };
    const req = {
      userName: this.user.userName,
      pageNumber: PaginatorKeys.pageIndex,
      pageSize: PaginatorKeys.pageSize
    }
    this.printService.getNotificationList(req).subscribe(notificationListObservable);
  }

  private setRecallList(): void {
    const recallList = [];
    if (this.notification) {
      const docInfo = this.notification.docInfo;
      recallList.push({ 'printCopyNo': docInfo["#printCopyNo"] });
      if (docInfo.rePrintInfo) {
        docInfo.rePrintInfo.map(reprint => {
          if (reprint['#printStatus'] === "Successful") {
            recallList.push({ 'printCopyNo': reprint["#printCopyNo"] });
          }
        });
      }
    }
    this.recallList = recallList;
  }

  public completeRecall(): void {
    const notificationUpdateObservable: PartialObserver<HttpResponse | HttpErrorResponse> = {
      next: (result: HttpResponse) => {
        if (result.status === 'success') {
          this.toastr.success(this.i18nService.translate.instant('notification-components.Recall-completed-successfully'));
          this.getNotificationList();
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(this.i18nService.translate.instant('notification-components.Error-in-update-Recall'));
        this.loading = false;
      },
      complete: () => {
        this.showPopup = !this.showPopup;
      }
    };
    const req = this.notification;
    req.completionComment = this.recallComment;
    this.loading = true;
    this.recallService.completeRecall(req).subscribe(notificationUpdateObservable);
  }
  public openPopup(): void {
    this.showPopup = !this.showPopup;
    this.recallComment = '';
  }
  public closePopup(): void {
    this.showPopup = !this.showPopup;
  }
}
