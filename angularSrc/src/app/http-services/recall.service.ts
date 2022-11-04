import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class RecallService {

  constructor(private httpService: HttpService) { }

  public saveRecall(data: any): Observable<any>{
    return this.httpService.post('saveRecall', data);
  }

  public completeRecall(data: any):Observable<any>{
    return this.httpService.post('completeRecall', data);
  }

  public saveReconciliation(req: any): Observable<any>{
    return this.httpService.post('saveReconcile', req);
  }

  public updateDueDate(req: any): Observable<any>{
    return this.httpService.post('updateDueDate', req); 
  }

}
