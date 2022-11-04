import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintInfoComponent } from './print-info/print-info.component';
import { PrintDashboardComponent } from './print-dashboard/print-dashboard.component';
import { ReprintComponent } from './reprint/reprint.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { NotificationComponent } from './notification/notification.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  {
    path: '',
    component: PrintDashboardComponent,
    pathMatch: 'full'
  },
  {
    path: 'print',
    component: PrintInfoComponent
  },
  {
    path: 'rePrint',
    component: ReprintComponent
  },
  {
    path: 'audit',
    component: AuditTrailComponent
  },
  {
    path: 'dashboard',
    component: PrintDashboardComponent
  },
  {
    path: 'notification',
    component: NotificationComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('../app/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'logout',
    component: LogoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
