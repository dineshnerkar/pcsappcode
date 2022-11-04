import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { ProfileTemplate } from '../../models/profile';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-template',
  templateUrl: './profile-template.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ProfileTemplateComponent implements OnInit {
  public loading: boolean;
  public templateFilterList: Observable<ProfileTemplate[]>;
  public templateList: ProfileTemplate[];
  public template: ProfileTemplate;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<ProfileTemplateComponent>,
    private i18nService: I18nService) {
  }

  ngOnInit() {
    this.template = {} as ProfileTemplate;
    this.getProfileTemplateList();
  }

  private getProfileTemplateList(): void {
    const templateListObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          const templates = result.payload.filter(temp=> !(this.data.includes(temp._id))); 
          this.templateFilterList = of(templates);
          this.templateList = templates;
        } else {
          this.toastr.error('Error in getting template list');
        }
      },
      error: () => {
        this.toastr.error('Error in getting template list');
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getProfileTemplateList().subscribe(templateListObserver);
  }

  public addTemplateToProfile(): void {
    if (typeof this.template === 'object' && this.template.name !== undefined) {
      this.dialogRef.close({ status: 'success', template: this.template });
    } else {
      this.toastr.error("Please select template from list");
    }
  }

  public displayName(template: ProfileTemplate): string {
    return template ? template.name : '';
  }

  public filterRecipientsList(): void {
    if (this.templateList) {
      this.templateFilterList = of(this.templateList.filter(mas => {
        if (typeof this.template === 'string' && mas.name.indexOf(this.template) === 0) {
          return mas;
        }
      }));
      if (!this.templateFilterList) {
        this.templateFilterList = of([]);
      }
    }
  }
}
