import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminHttpService } from './admin-http.service';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(private readonly httpService: AdminHttpService) { }

  public getPrinterList(): Observable<any> {
    return this.httpService.post('getPrinterList', {});
  }

  public updatePrinterConfiguration(obj): Observable<any> {
    return this.httpService.post('updatePrinterConfiguration', obj);
  }

  public deletePrinter(obj): Observable<any> {
    return this.httpService.post('deletePrinter', obj);
  }

  public addPrinter(obj): Observable<any> {
    if (obj._id) {
      return this.httpService.post('updatePrinter', obj);
    } else {
      return this.httpService.post('addPrinter', obj);
    }
  }

}
