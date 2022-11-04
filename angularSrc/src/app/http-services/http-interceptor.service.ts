import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { SessionService } from '../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private session: SessionService, private readonly router: Router) { }
  private setAuthorizationHeader(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.session.getUserToken();
    if (token && !req.url.includes('login')) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });
    } else {
      return req.clone({
        withCredentials: true
      });
    }
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.setAuthorizationHeader(req)).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {

        }
      }),
      catchError(error => {
        if (error.status === 401) {
          this.router.navigate(['/logout']);
        } else {
          return throwError(error);
        }
      }),
      finalize(() => {
      })
    );

  }
}
