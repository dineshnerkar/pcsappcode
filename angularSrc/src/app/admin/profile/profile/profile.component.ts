
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog, MatDialogConfig, MatDialogRef, MatTable } from '@angular/material';
import { ProfileTemplateComponent } from './profile-template.component';
import { ToastrService } from 'ngx-toastr';
import { I18nService } from 'src/app/service/i18n.service';
import { InputFiled, InputPrintType, InputTypes, Profile, ProfileTemplate } from '../../models/profile';
import { ActivatedRoute, Router } from '@angular/router';
import { PartialObserver } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ProfileComponent implements OnInit {

  public loading: boolean;
  public profile: Profile;
  public isUpdate: boolean;
  public isAllTemplateSaved: boolean;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public fruitCtrl = new FormControl();
  public displayedColumns: string[] = ['key', 'name', 'type', 'validation', 'selectOptions', 'action'];
  @ViewChild('fruitInput', { static: false }) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild("MatTable", { static: false }) table: MatTable<any>;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toaster: ToastrService,
    private i18nService: I18nService
  ) {
    this.isAllTemplateSaved = true;
  }

  ngOnInit() {
    this.profile = {
      templates: []
    } as Profile;
    this.route.queryParams.subscribe(param => {
      if (Object.keys(param).length !== 0) {
        if (param['id'] && param['id'] !== null) {
          this.isUpdate = true;
          this.getProfileInfo(param['id']);
        }
      }
    });
  }

  private getProfileInfo(id): void {
    const profileObserver: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.profile = result.payload[0];
          this.isAllTemplateSaved = true;
        } else {
          this.toaster.error(this.i18nService.translate.instant('profile-component.error.getData'));
        }
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.getProfileInfo({ _id: id } as Profile).subscribe(profileObserver);
  }

  public openFile(index: number): void {
    let el: HTMLElement = document.getElementById(`fileId${index}`) as HTMLElement;
    el.click();
  };

  public selectFile(files: FileList, index: number): void {
    const file: File = files.item(0);
    if (this.profile.userInputFields) {
      this.profile.userInputFields = this.profile.userInputFields.filter(field => field.templateId !== `${index}`);
    }
    if (file.type === 'application/pdf' && Math.round((file.size / (1024 * 1024))) <= 5) {
      const formFiledObservable: PartialObserver<any> = {
        next: (result) => {
          if (result.status == 'success') {
            const fields = Object.keys(result.payload).map(key => {
              return { key: key, value: result.payload[key] };
            });
            let filed1 = [];
            this.profile.templates.map((temp, i) => {
              if (temp.fields && i !== index) {
                filed1 = temp.fields.concat(filed1);
              }
            });
            const filteredArray = fields.map(k => k.key).filter(value => filed1.map(k => k.key).includes(value));
            if (filteredArray.length === 0) {
              this.profile.templates[index].url = file.name;
              this.profile.templates[index].file = file;
              this.profile.templates[index].fields = fields;
              fields.map(field => {
                const input = {
                  key: field.key,
                  value: field.value,
                  show: field.key.startsWith('^') ? true : false,
                  printType: field.key.startsWith('#') ? InputPrintType.Input : field.key.startsWith('@') ? InputPrintType.Meta : field.key.startsWith('^') ? InputPrintType.System : InputPrintType.None,
                  templateId: index + '',
                  name: '',
                  type: InputTypes.Text,
                  validation: null,
                  selectOptions: null
                };
                if (!this.profile.userInputFields) {
                  this.profile.userInputFields = [];
                }
                this.profile.userInputFields.push(input);
              });
              if (this.table) {
                this.table.renderRows();
              }
            } else {
              this.toaster.error(this.i18nService.translate.instant('profile-component.error.overlapping') + filteredArray);
            }
          } else {
            this.toaster.error(this.i18nService.translate.instant('profile-component.error.invalidPdf'));
          }
        },
        error: () => {
          this.toaster.error(this.i18nService.translate.instant('profile-component.error.invalidPdf'));
        },
        complete: () => {
          this.loading = false;
        }
      }
      this.loading = true;
      this.profileService.getFormFields(file).subscribe(formFiledObservable);
    } else {
      this.toaster.error(this.i18nService.translate.instant('profile-component.error.fileSize'));
    }

  }

  public openProfileTemplateDialog(): void {
    const config: MatDialogConfig = {
      width: '600px',
      data: this.profile.templates.map(temp => temp._id)
    }

    const internalUserDialogRef: MatDialogRef<ProfileTemplateComponent> = this.dialog.open(ProfileTemplateComponent, config);
    internalUserDialogRef.afterClosed().subscribe(result => {
      if (result.status === 'success') {
        this.addTemplate(result.template);
      }
    });
  }

  private addTemplate(template: ProfileTemplate): void {
    template.index = Math.max.apply(Math, this.profile.templates.map((o) => { return o.index; })) + 1;
    this.profile.templates.push(template);
  }

  public addNewTemplate() {
    this.isAllTemplateSaved = false;
    this.addTemplate({} as ProfileTemplate);
  }

  public saveTemplate(index): void {
    const template = this.profile.templates[index];
    console.log(template);
    if (template.name !== undefined) {
      if (template.fields === undefined && template.file === undefined) {
        this.toaster.error(this.i18nService.translate.instant('profile-component.error.templateFile'));
        return;
      }
    } else {
      this.toaster.error(this.i18nService.translate.instant('profile-component.error.templateName'));
      return;
    }
    const profileTemplateObservable: PartialObserver<any> = {
      next: (result) => {
        if (result.status === 'success') {
          this.profile.templates[index] = result.payload;
          this.isAllTemplateSaved = true;
        } else {
          this.toaster.error(this.i18nService.translate.instant('profile-component.error.saveTemplate'));
        }
      },
      error: () => {
        this.toaster.error(this.i18nService.translate.instant('profile-component.error.saveTemplate'));
      },
      complete: () => {
        this.loading = false;
      }
    };
    this.loading = true;
    this.profileService.saveTemplate(this.profile.templates[index]).subscribe(profileTemplateObservable);

  }

  public deleteTemplate(index: number): void {
    this.profile.templates.splice(index, 1);
    if (this.profile.userInputFields) {
      this.profile.userInputFields = this.profile.userInputFields.filter(field => field.templateId !== `${index}`);
      this.table.renderRows();
    }
    this.isAllTemplateSaved = this.profile.templates.length === 0 ? true : this.isAllTemplateSaved;
  }

  public moveDown(e, index): void {
    e.stopPropagation();
    [this.profile.templates[index], this.profile.templates[index + 1]] = [this.profile.templates[index + 1], this.profile.templates[index]];
    this.assignIndex();
  }

  public moveUp(e, index): void {
    e.stopPropagation();
    [this.profile.templates[index], this.profile.templates[index - 1]] = [this.profile.templates[index - 1], this.profile.templates[index]];
    this.assignIndex();
  }

  private assignIndex(): void {
    this.profile.templates = this.profile.templates.map((temp, index) => {
      temp.index = index + 1;
      return temp;
    });
  }

  public addNewUserInput(): void {
    if (this.profile.userInputFields === undefined) {
      this.profile.userInputFields = [];
    }
    this.profile.userInputFields.push({ printType: InputPrintType.System, show: true, type: InputTypes.Text, name: '', key: '', selectOptions: null, validation: null, templateId: "-1" } as InputFiled);
    this.table.renderRows();
  }

  public addSelectOptions(event, userInputs): void {
    if (!userInputs.selectOptions) {
      userInputs.selectOptions = [];
    };
    const input = event.input;
    const value = event.value.trim();
    userInputs.selectOptions.push({ label: value, value: value });
    if (input) {
      input.value = '';
    }
    this.fruitCtrl.setValue(null);
  }

  public removeSelectOptions(userInputs, filed): void {
    userInputs.selectOptions = userInputs.selectOptions.filter(opt => opt.label !== filed.label);
  }

  public deleteUserInputFields(index: number): void {
    this.profile.userInputFields.splice(index, 1);
    this.table.renderRows();
  }

  private validateProfileTemplate(): boolean {
    let valid = true;
    if (this.profile.templates && this.profile.templates.length > 0) {
      for (let template of this.profile.templates) {
        if (template._id) {
          if (!template.name || !template.url) {
            this.toaster.error(this.i18nService.translate.instant('profile-component.error.fillAll'));
            valid = false;
          }
        } else {
          this.toaster.error(this.i18nService.translate.instant('profile-component.error.pleaseSave') + template.name);
          valid = false;
        }
      }
    } else {
      valid = false;
    }
    return valid;
  }

  private validateProfileFields(): boolean {
    let valid = true;
    if (this.profile.userInputFields) {
      for (let field of this.profile.userInputFields) {
        if (field.show) {
          if (!field.name || !field.validation) {
            valid = false;
          } else {
            if (field.type === InputTypes.Dropdown && !field.selectOptions) {
              valid = false;
            }
          }
        }
      }
    }
    return valid;
  }

  private validateProfile(): boolean {
    let valid = true;
    if (this.profile) {
      valid = this.validateProfileTemplate();
      if (valid) {
        valid = this.validateProfileFields();
      }
    } else {
      valid = false;
    }
    return valid;
  }

  public saveProfile(): void {
    if (this.validateProfile()) {
      const profileObserver: PartialObserver<any> = {
        next: (result) => {
          if (result.status === 'success') {
            this.toaster.success(this.i18nService.translate.instant('profile-component.saveProfileSuccess'));
            this.router.navigate(['admin/profile-list'], {});
          } else {
            this.toaster.error(this.i18nService.translate.instant('profile-component.error.saveProfile'));
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.error.message) {
            this.toaster.error(error.error.message);
          } else {
            this.toaster.error(this.i18nService.translate.instant('profile-component.error.saveProfile'));
          }
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = true;
      this.profileService.saveProfile(this.profile).subscribe(profileObserver);
    }
  }

  public gotoDashboard(): void {
    this.router.navigate(['admin/profile-list'], {});
  }
}
