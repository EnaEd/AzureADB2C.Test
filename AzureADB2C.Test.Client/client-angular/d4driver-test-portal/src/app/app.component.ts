import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from './shared/providers/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'd4driver-test-portal';
    
    get loginDisplay(): boolean {
        return this._accountService.loginDisplay;
    };
    get isIframe(): boolean {
        return this._accountService.isIframe;
    };
    
    constructor(
      private readonly _accountService: AccountService
    ) { }
    ngOnDestroy(): void {
        this._accountService.onDestroy();
    }
    ngOnInit(): void {
        this._accountService.init();
    }
    onLoginClick(): void {
        this._accountService.login();
    }
    onEditProfileClick(): void {
        this._accountService.editProfile();
    }
    onLogoutClick(): void {
        this._accountService.logout();
    }
}
