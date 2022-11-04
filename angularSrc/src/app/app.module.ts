import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrintDashboardComponent } from './print-dashboard/print-dashboard.component';
import { PrintInfoComponent } from './print-info/print-info.component';
import { HttpService } from './http-services/http.service';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatChipsModule, MatIconModule, MatDialogModule, MAT_DATE_LOCALE } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocketService } from './service/socket.service';
import { ReprintComponent } from './reprint/reprint.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NotificationComponent } from './notification/notification.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MinValidatorDirective } from './directive/min-validator.directive';
import { MaxValidatorDirective } from './directive/max-validator.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogComponent } from './admin/common/dialog/dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpInterceptorService } from './http-services/http-interceptor.service';
import { LogoutComponent } from './logout/logout.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
  // return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
@NgModule({
  entryComponents: [DialogComponent],
  declarations: [
    AppComponent,
    PrintDashboardComponent,
    PrintInfoComponent,
    ReprintComponent,
    AuditTrailComponent,
    HeaderComponent,
    FooterComponent,
    NotificationComponent,
    DialogComponent,
    MinValidatorDirective,
    MaxValidatorDirective,
    LogoutComponent
  ],
  imports: [
    ToastrModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatInputModule,
    MatTableModule,
    MatListModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatGridListModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTooltipModule,
    MatSlideToggleModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],

      },
      // isolate: false

    })

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [HttpService, SocketService, ToastrService, DatePipe,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorService,
    multi: true
  },{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
