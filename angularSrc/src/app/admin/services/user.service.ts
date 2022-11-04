import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminHttpService } from 'src/app/admin/services/admin-http.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userList = new BehaviorSubject([]);

  public externalUserList = new BehaviorSubject([]);

  constructor(private readonly httpService: AdminHttpService) { }

  public getAllInternalUserList(): Observable<any> {
    return this.httpService.post('getInternalUsersList', {});
  }

  public addInternalUser(obj): Observable<any> {
    if (obj._id) {
      return this.httpService.post('updateInternalUser', obj);
    } else {
      return this.httpService.post('addInternalUser', obj);
    }
  }

  public getAddedInternalUsers(obj): Observable<any> {
    return this.httpService.post('getInternalUsers', obj);
  }

  public assignInternalUsers(obj): Observable<any> {
    return this.httpService.post('assignInternalUsers', obj);
  }

  public deleteInternalUser(obj): Observable<any> {
    return this.httpService.post('deleteInternalUser', obj);
  }

  public getUserCount(): Observable<any> {
    return this.httpService.post('getUserCount', {});
  }

  public updateUserCount(data): Observable<any> {
    return this.httpService.post('updateUserCount', data);
  }

  public getAdminAudit(data): Observable<any> {
    return this.httpService.post('getAdminAudit', data);
  }

  public getAllExternalUserList(): Observable<any> {
    return this.httpService.post('getExternalUsersList', {});
  }

  public getExternalUsers(obj): Observable<any> {
    return this.httpService.post('getExternalUsers', obj);
  }

  public addExternalUser(obj): Observable<any> {
      return this.httpService.post('addExternalUser', obj);
  }

  public assignExternalUsers(obj): Observable<any> {
    return this.httpService.post('assignExternalUsers', obj);
  }

  public deleteExternalUser(obj): Observable<any> {
    return this.httpService.post('deleteExternalUser', obj);
  }
}
