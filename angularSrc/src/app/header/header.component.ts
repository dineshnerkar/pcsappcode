import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartialObserver } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PrintService } from '../http-services/print.service';
import { DocumentService, UserService, SocketService, I18nService, SessionService } from '../service';
import { SelectOption } from '../models/selectOption';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  public docInfo: any;
  public user: any;
  public browserLang: any;
  public currentLang: any;
  public notificationCount: number;
  public langList: SelectOption[];
  public lang: any;
  public isAdminUser: boolean;
  public isAdminView: boolean;
  public isLoading: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docService: DocumentService,
    private socketService: SocketService,
    private userService: UserService,
    private printService: PrintService,
    private session: SessionService,
    private i18nService: I18nService) {
    this.docService.documentInfo.subscribe((result: any) => {
      if (result) {
        this.docInfo = result;
      }
    });
    this.userService.user.subscribe((result: any) => {
      if (result) {
        this.user = result;
        if (this.user && this.user.roles['imp_admin']) {
          this.isAdminUser = true;
        }
      }
    });
    this.socketService.notificationCount.subscribe((count: number) => {
      this.notificationCount = count;
    });

    this.i18nService.langSource.subscribe(langs => {
      if (langs) {
        this.langList = langs.map((lang) => {
          return { 'label': lang, 'value': lang }
        });
      }
    });
    this.i18nService.currentLang.subscribe(lang => {
      if (lang) {
        this.lang = lang;
      }
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(param => {
      if (Object.keys(param).length !== 0) {
        if (param['token']) {
          const loginObservable: PartialObserver<any> = {
            next: (result: any) => {
              if (result.status === 'success') {
                this.session.saveUserDetails(result.payload);
                this.userService.setUser(result.payload);
                if (param['documentNumber'] && param['revision']) {
                  this.docService.setDocument({ documentNumber: param['documentNumber'], revision: param['revision'] });
                }
                this.getNotificationCount();
                this.connectNotificationSocket(result.payload.userName);
              }
            },
            error: (error) => {
             
            },
            complete: () => {
              this.isLoading = false;
            }
          };
          this.printService.login({ userName: param['infocardId'] ? param['infocardId'] : "IMPCAT" , password: 'password', token: param['token'] }).subscribe(loginObservable);
        } else {
         
        }
      }
    });
  }
  private getNotificationCount(): void {
    const notificationListObservable: PartialObserver<any | HttpErrorResponse> = {
      next: (result: any) => {
        if (result.status === 'success') {
          this.notificationCount = result.payload.count;
          this.socketService.setNotificationCount(this.notificationCount);
        } else {
          this.notificationCount = 0;
        }
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {
      }
    };
    const req: any = { userName: this.user.userName }
    this.printService.getNotificationCount(req).subscribe(notificationListObservable);
  }

  public gotoNotification(): void {
    this.router.navigate(['notification']);
  }

  public connectNotificationSocket(id) {
    this.socketService.connectToNotificationSocket(id);
  }

  public switchLang(lang: string): void {
    this.i18nService.setLang(lang);
  }

  public changeView(): void {
    if (this.isAdminView) {
      this.router.navigate(['admin'], {});
    } else {
      this.router.navigate(['dashboard'], {});
    }
  }
}
