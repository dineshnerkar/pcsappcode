import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveDialogModalComponent } from './active-dialog-modal/active-dialog-modal.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { UserService } from 'src/app/admin/services/user.service';
import { PartialObserver } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class AdminDashboardComponent implements OnInit {

  public intUserCount: number;
  public isLoading: boolean;
  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog,
    private userService: UserService) { }
  ngOnInit() {
    this.intUserCount = 0;
    this.getInternalUserCount();
  }

  private getInternalUserCount(): void {
    const countObservable: PartialObserver<any | HttpErrorResponse> = {
      next: (result) => {
        if (result.status === 'success') {
          this.intUserCount = result.payload[0].count;
        }
      },
      error: () => {

      },
      complete: () => {
        this.isLoading = false;
      }
    };
    this.isLoading = true;
    this.userService.getUserCount().subscribe(countObservable);
  }

  public openActiveModel(e): void {
    e.stopPropagation();
    const config: MatDialogConfig = {
      width: '500px',
    };
    config.data = { count: this.intUserCount };
    const dialogRef: MatDialogRef<ActiveDialogModalComponent> = this.dialog.open(ActiveDialogModalComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      this.getInternalUserCount();
    });
  };

  public goto(url): void {
    this.router.navigate([url], { relativeTo: this.route });
  }
}
