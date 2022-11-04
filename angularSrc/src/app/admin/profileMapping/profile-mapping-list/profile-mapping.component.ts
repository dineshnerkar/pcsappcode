import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, PartialObserver } from 'rxjs';
import { I18nService } from 'src/app/service/i18n.service';
import { Profile, ProfileDocument, ProfileDocumentMapping } from '../../models/profile';
import { ProfileService } from '../../services/profile.service';
import { FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-profile-mapping',
  templateUrl: './profile-mapping.component.html',
  styleUrls: ['./profile-mapping-list.component.scss']
})
export class ProfileMappingComponent implements OnInit {

  public profileDocumentMapping: ProfileDocumentMapping;
  public profileList: Profile[];
  public documentList: ProfileDocument[];
  public profileOptions: Observable<Profile[]>;
  public documentOptions: Observable<ProfileDocument[]>;
  public isUpdate: boolean;
  public loading: boolean;
  public error: any = {};
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public fruitCtrl = new FormControl();
  @ViewChild('fruitInput', { static: false }) fruitInput: ElementRef<HTMLInputElement>;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ProfileMappingComponent>,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private i18nService: I18nService) {
    this.profileService.profileList.subscribe(result => {
      if (result) {
        const list = result.filter(result => !result.isDocumentMapped);
        this.profileList = list;
        this.profileOptions = of(list);
      }

    });
    this.profileService.documentList.subscribe(result => {
      if (result) {
        this.documentList = result;
        this.documentOptions = of(result);
      }
    });
  }

  ngOnInit() {
    this.profileDocumentMapping = this.data.profileDocumentMapping;
    this.isUpdate = this.data.isUpdate;
    if (this.isUpdate) {
      this.data.profileDocumentMapping.documents = new Set(this.data.profileDocumentMapping.documents);
    }
  }

  public addSelectOptions(event): void {
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  public removeSelectOptions(profile: ProfileDocument): void {
    this.profileDocumentMapping.documents.delete(profile);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.profileDocumentMapping.documents) {
      this.profileDocumentMapping.documents = new Set([]);
    }
    this.profileDocumentMapping.documents.add(event.option.value);
    this.profileDocumentMapping.documents = new Set([...new Map(Array.from(this.profileDocumentMapping.documents).map(item => [item.id, item])).values()]);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  public saveMapping(): void {
    if (this.profileDocumentMapping && !this.profileDocumentMapping.profile) {
      this.error.profile = 'required';
    }
    if (this.profileDocumentMapping && this.profileDocumentMapping.profile && this.profileDocumentMapping.documents && typeof this.profileDocumentMapping.profile !== 'string' && typeof this.profileDocumentMapping.documents !== 'string' && this.profileDocumentMapping.documents.size > 0) {
      const mappingObserver: PartialObserver<any> = {
        next: (result) => {
          if (result.status === 'success') {
            this.toastr.success(this.i18nService.translate.instant('profile-mapping-component.Profile-Mapping-Added-Successfully'));
            this.dialogRef.close({ status: 'success' });
          }
        },
        error: () => {
          this.toastr.error(this.i18nService.translate.instant('profile-mapping-component.saveError'));
          this.dialogRef.close({ status: 'error' });
        },
        complete: () => {
          this.loading = false;
        }
      };
      this.loading = false;
      this.profileService.addProfileMapping(this.profileDocumentMapping).subscribe(mappingObserver);
    } else {
      this.error.profile = 'required';
      this.error.documents = 'required';
      this.toastr.error(this.i18nService.translate.instant('profile-mapping-component.formError'));
    }
  }

  public filterProfileName(): void {
    if (this.profileList) {
      this.profileOptions = of(this.profileList.filter(mas => {
        if (typeof this.profileDocumentMapping.profile === 'string' && mas.name.toLowerCase().indexOf(this.profileDocumentMapping.profile) === 0) {
          return mas;
        }
      }));
      if (!this.profileOptions) {
        this.profileOptions = of([]);
      }
    }
  }

  public displayName(profile: Profile | null): string {
    if (profile === null || profile === undefined) {
      return '';
    } else {
      return profile.name;
    }
  }

  public filterDocumentName(e): void {
    if (this.documentList) {
      this.documentOptions = of(this.documentList.filter(mas => {
        if (typeof e === 'string' && mas.name.toLowerCase().indexOf(e.toLowerCase()) === 0) {
          return mas;
        }
      }));
      if (!this.documentOptions) {
        this.documentOptions = of([]);
      }
    }
  }
}
