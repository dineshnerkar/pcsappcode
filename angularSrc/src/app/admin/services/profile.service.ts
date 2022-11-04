import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Profile, ProfileDocumentMapping, ProfileTemplate } from '../models/profile';
import { AdminHttpService } from './admin-http.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public profileList = new BehaviorSubject(undefined);
  public documentList = new BehaviorSubject(undefined);

  constructor(private httpService: AdminHttpService) { }

  public getProfileList(filterObj): Observable<any> {
    return this.httpService.post('getProfileList', filterObj);
  }
  
  public deleteProfile(obj: Profile): Observable<any> {
    return this.httpService.post('deleteProfile', obj);
  }

  public deleteProfileMapping(obj: ProfileDocumentMapping): Observable<any> {
    return this.httpService.post('deleteProfileMapping', obj);
  }

  public saveProfile(profile: Profile): Observable<any> {
    const dbProfile = { ...profile };
    dbProfile.templates.map(temp => {
      return { _id: temp._id, index: temp.index };
    })
    if (profile._id) {
      return this.httpService.post('updateProfile', dbProfile);
    } else {
      return this.httpService.post('saveProfile', dbProfile);
    }
  }

  public getDocumentTypes(): Observable<any> {
    return this.httpService.post('getDocumentTypes', {});
  }

  public saveTemplate(data: ProfileTemplate): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    if(data.file){
      formData.append('data', data.file);
      formData.append('fields', JSON.stringify(data.fields));
    }
    if (data._id) {
      formData.append('_id', data._id);
      return this.httpService.post('updateProfileTemplate', formData);
    } else {
      return this.httpService.post('saveProfileTemplate', formData);
    }
  }

  public getFormFields(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('data', file);
    return this.httpService.post('getFormFields', formData);
  }

  public getProfileInfo(profile: Profile): Observable<any> {
    return this.httpService.post('getProfile', profile);
  }

  public getProfileTemplateList(): Observable<any> {
    return this.httpService.post('getProfileTemplateList', {});
  }

  public getProfileDocumentList(filterObj: any): Observable<any> {
    return this.httpService.post('getProfileDocumentList', filterObj);
  }

  public getDocumentList(obj: any): Observable<any> {
    return this.httpService.post('getDocumentTypes', obj);
  }

  public addProfileMapping(profile: ProfileDocumentMapping) {
    const dbObj = { _id: profile._id, profileId: profile.profile._id, profileName: profile.profile.name, documents: Array.from(profile.documents) };
    if (dbObj._id) {
      return this.httpService.post('updateProfileDocumentMapping', dbObj);
    } else {
      return this.httpService.post('saveProfileDocumentMapping', dbObj);
    }
  }
}
