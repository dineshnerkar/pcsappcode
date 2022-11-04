import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  public langSource: any = new BehaviorSubject(['en', 'jp']);
  public currentLang: any = new BehaviorSubject('en');
  constructor(
    public translate: TranslateService) {
    this.translate.addLangs(['en', 'jp']);
    this.translate.setDefaultLang('en');
    const lang = localStorage.getItem("currentLang");
    if (lang) {
      this.currentLang.next(lang);
      this.translate.use(lang);
    } else {
      this.currentLang.next("en");
      this.translate.use("en");
    }
  }
  public setLang(lang: string): void {
    this.currentLang.next(lang);
    this.translate.use(lang);
    localStorage.setItem("currentLang", lang);
  }
}
