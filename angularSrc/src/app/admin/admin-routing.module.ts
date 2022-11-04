import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuditComponent } from './audit/audit.component';
import { PrinterListComponent } from './printer/printer-list/printer-list.component';
import { ProfileListComponent } from './profile/profile-list/profile-list.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { ProfileMappingListComponent } from './profileMapping/profile-mapping-list/profile-mapping-list.component';
import { ReasonsListComponent } from './reasons/reasons-list/reasons-list.component';
import { ExternalUserListComponent } from './users/external-user-list/external-user-list.component';
import { InternalUserListComponent } from './users/internal-user-list/internal-user-list.component';


const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'user-list',
    component: InternalUserListComponent
  },
  {
    path: 'profile-list',
    component: ProfileListComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'reasons-list',
    component: ReasonsListComponent
  },
  {
    path: 'profile-mapping-list',
    component: ProfileMappingListComponent
  },
  {
    path: 'printer-list',
    component: PrinterListComponent
  },
  {
    path: 'ext-user-list',
    component: ExternalUserListComponent
  },
  {
    path: 'admin-audit',
    component: AuditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
