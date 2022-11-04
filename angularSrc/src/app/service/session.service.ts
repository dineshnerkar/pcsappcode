import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  public saveUserDetails(user): void {
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  public getUserRoles(): any {

  }
  public getUserToken(): string {
    const user = sessionStorage.getItem('user');
    if (user) {
      return JSON.parse(user).jwt;
    } else {
      return "";
    }

  }
}
