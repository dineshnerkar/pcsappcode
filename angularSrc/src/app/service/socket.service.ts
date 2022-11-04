import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';
import { PrintService } from '../http-services/print.service';
import { ToastrService } from 'ngx-toastr';
import { io } from "socket.io-client";
import { environment } from 'src/environments/environment';
import { I18nService } from '../service/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private printerSocket: WebSocket;
  private notificationSocket: any;
  private isConnected: boolean = false;
  public notificationCount = new BehaviorSubject(0);
  public printerList = new BehaviorSubject([]);

  constructor(
    private printService: PrintService,
    private toast: ToastrService,
    private i18nService: I18nService
  ) {
    this.testSocket();
  }
  public async connectToNotificationSocket(id) {
    if (!this.isConnected) {
      const notificationSoc = io(environment.SOCKET_PATH, {
        path: "/socketApi",
        query: {
          userName: id
        }
      });
      notificationSoc.on("connect", () => {
        this.isConnected = true;
      });
      notificationSoc.on("new_notification", (msg) => {
        if (msg) {
          const count = this.notificationCount.getValue();
          this.notificationCount.next(count + 1);
        }
      });
      notificationSoc.on("notification_count", (msg) => {
        this.notificationCount.next(msg);
      });
      this.notificationSocket = notificationSoc;
    }
  }
  private async testSocket() {
    const socket1 = await this.createTempSocket(9010);
    if (socket1 === 0) {
      const socket2 = await this.createTempSocket(9020);
      if (socket2 === 0) {
        const socket3 = await this.createTempSocket(9030);
        if (socket3 === 0) {
          const socket4 = await this.createTempSocket(9040);
          if (socket4 === 0) {
            this.toast.error(this.i18nService.translate.instant('socket-service.connection-error1'));
          }
        }
      }
    }
  }

  private createTempSocket(port) {
    return new Promise((resolve, reject) => {
      const server = new WebSocket('ws://localhost:' + port, 'echo-protocol');
      server.onopen = () => {
        this.assignSocket(server);
        resolve(1);
      };
      server.onerror = (err) => {
        server.close();
        resolve(0);
      };
    });
  }

  private updateStatus(data: any) {
    const updateObserver: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.toast.success(this.i18nService.translate.instant('socket-service.Print-Status-Updated'));
        }
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      }
    };
    this.printService.updatePrintStatus({ docIds: data.docPrint, reprintId: data.reprintId }).subscribe(updateObserver);
  }
  private assignSocket(socket: WebSocket) {
    this.printerSocket = socket;
    this.printerSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'PrinterList') {
        this.validatePrinterList(data.payload);
      } else if (data.type === 'print' || data.type === 'rePrint') {
        if (data.docPrint) {
          this.updateStatus(data);
        } else {
          // alert(data.payload);
        }
      } if (data.type === 'Error') {
        this.toast.error("Error");
      }
    };
    this.printerSocket.onerror = (event) => {
      this.toast.error(this.i18nService.translate.instant('socket-service.connection-error1'));
    };
  }

  private validatePrinterList(printerList: string[]) {
    const printerListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.printerList.next(result.payload);
        } else {
          this.printerList.next([]);
        }
      }, error: () => {
        this.printerList.next([]);
      }, complete: () => {
      }
    };
    this.printService.validatePrinterList(printerList).subscribe(printerListObserver);
  }

  public getPrinterList() {
    if (this.printerSocket) {
      this.printerSocket.send(JSON.stringify({ type: 'getPrinters' }));
    } else {
      this.toast.warning(this.i18nService.translate.instant('socket-service.Please-Connect-with-printer-utility'))
    }
  }

  public print(docName: string[], printer: string) {
    if (this.printerSocket) {
      this.printerSocket.send(JSON.stringify({ type: 'print', docId: docName, printerName: printer }));
    } else {
      const docPrint = docName.map(n=>{ return {_id: n, status: 'Failed'}});
      this.updateStatus({docPrint: docPrint});
      this.toast.warning(this.i18nService.translate.instant('socket-service.Please-Connect-with-printer-utility'))
    }
  }

  public rePrint(docName: string[], printer: string, reprintId: string) {
    if (this.printerSocket) {
      this.printerSocket.send(JSON.stringify({ type: 'rePrint', reprintId: reprintId, docId: docName, printerName: printer }));
    } else {
      const docPrint = docName.map(n=>{ return {_id: n, status: 'Failed'}});
      this.updateStatus({docPrint: docPrint});
      this.toast.warning(this.i18nService.translate.instant('socket-service.Please-Connect-with-printer-utility'))
    }
  }
  public setNotificationCount(notificationCount: number): void {
    this.notificationCount.next(notificationCount);
  }
}
