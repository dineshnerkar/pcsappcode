import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  public pad(num, size): string {
    var s = "00" + num;
    return s.substr(s.length - size);
  }

  public getDateString(date: Date): string {
    return date.getDate() + "/" + (date.getMonth()) + "/" + date.getFullYear();
  }

  public getPrintDateTime(dat: string): string {
    const date = new Date(dat);
    return `${this.pad(date.getDate(), 2)}/${this.pad(date.getMonth() + 1, 2)}/${date.getFullYear()}, ${this.pad(date.getHours(), 2)}: ${this.pad(date.getMinutes(), 2)}`;
  }

  public getDate(dat: string): string {
    const date = new Date(dat);
    return `${this.pad(date.getMonth() + 1, 2)}/${this.pad(date.getDate(), 2)}/${date.getFullYear()}`;
  }
}
