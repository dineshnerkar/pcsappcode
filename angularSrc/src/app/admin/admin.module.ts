import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { InternalUserListComponent } from './users/internal-user-list/internal-user-list.component';
import { InternalUserComponent } from './users/internal-user-list/internal-user.component';
import { ExternalUserListComponent } from './users/external-user-list/external-user-list.component';
import { ExternalUserComponent } from './users/external-user-list/external-user.component';
import { AdminRoutingModule } from './admin-routing.module';
import { MatSidenavModule, MatChipsModule, MatInputModule, MatTableModule, MatListModule, MatAutocompleteModule, MatSelectModule, MatGridListModule, MatIconModule, MatDialogModule, MatButtonToggleModule, MatDatepickerModule, MatNativeDateModule, MatPaginatorModule, MatCheckboxModule, MatRadioModule, MatTooltipModule } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ReasonsListComponent } from './reasons/reasons-list/reasons-list.component';
import { ReasonsComponent } from './reasons/reasons-list/reasons.component';
import { ProfileListComponent } from './profile/profile-list/profile-list.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { PrinterListComponent } from './printer/printer-list/printer-list.component';
import { PrinterComponent } from './printer/printer-list/printer.component';
import { ProfileMappingListComponent } from './profileMapping/profile-mapping-list/profile-mapping-list.component';
import { ProfileMappingComponent } from './profileMapping/profile-mapping-list/profile-mapping.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ProfileTemplateComponent } from './profile/profile/profile-template.component';
import { ActiveDialogModalComponent } from './admin-dashboard/active-dialog-modal/active-dialog-modal.component';
import { AuditComponent } from './audit/audit.component';


@NgModule({
  declarations: [AdminDashboardComponent, InternalUserListComponent,
    InternalUserComponent, ExternalUserListComponent, ExternalUserComponent,
    ReasonsListComponent, ReasonsComponent, ProfileListComponent, ProfileComponent,
    PrinterListComponent, PrinterComponent, ProfileMappingListComponent,
    ProfileMappingComponent, ProfileTemplateComponent,ActiveDialogModalComponent, AuditComponent],
  entryComponents: [
    ProfileTemplateComponent,
    InternalUserComponent,
    ExternalUserComponent,
    ReasonsComponent,
    PrinterComponent,
    ProfileMappingComponent,
    ActiveDialogModalComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatSidenavModule,
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
    MatTabsModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatExpansionModule,
    TranslateModule.forChild({
      defaultLanguage: 'en',
      // loader: {
      //   provide: TranslateLoader,
      //   useFactory: HttpLoaderFactory,
      //   deps: [HttpClient],

      // },
      extend: true

    })
  ],
  providers: [
    TranslateService
  ]
})
export class AdminModule { }
