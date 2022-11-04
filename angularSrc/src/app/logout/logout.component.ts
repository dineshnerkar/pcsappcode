import { Component, OnInit } from '@angular/core';
import { I18nService, UserService } from '../service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  public user: any;

  constructor(private userService: UserService, private i18nService: I18nService) {
  }

  ngOnInit() {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
  }

}
