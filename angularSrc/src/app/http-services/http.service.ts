import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IRequestOptions {
  body?: any;
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: any | 'json';
  withCredentials?: boolean;
}

@Injectable()
export class HttpService {

  public constructor(public http: HttpClient) { }

  public delete<T>(url: string, options?: IRequestOptions): Observable<T> {
    return this.http.delete<T>(`${environment.API_PATH}/${url}`, options);
  }

  public get<T>(url: string, options?: IRequestOptions): Observable<T> {
    return this.http.get<T>(`${environment.API_PATH}/${url}`, options);
  }

  public post<T>(url: string, params: any, options?: IRequestOptions): Observable<T> {
    return this.http.post<T>(`${environment.API_PATH}/${url}`, params, options);
  }

  public put<T>(url: string, params: any, options?: IRequestOptions): Observable<T> {
    return this.http.put<T>(`${environment.API_PATH}/${url}`, params, options);
  }
}
