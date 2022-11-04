import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminHttpService } from './admin-http.service';

@Injectable({
  providedIn: 'root'
})
export class ReasonService {

  constructor(private readonly httpService: AdminHttpService) { }

  public getReasonList(obj): Observable<any> {
    return this.httpService.post('getReasonList', obj);
  }

  public deleteReason(obj): Observable<any> {
    return this.httpService.post('deleteReason', obj);
  }

  public addReason(obj): Observable<any> {
    if (obj._id) {
      return this.httpService.post('updateReason', obj);
    } else {
      return this.httpService.post('addReason', obj);
    }
  }

}
