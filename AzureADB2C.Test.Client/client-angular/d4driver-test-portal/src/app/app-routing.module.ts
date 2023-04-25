import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { FailedComponent } from './failed/failed.component';
import { BrowserUtils } from '@azure/msal-browser';

const routes: Routes = [
  {
      path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
      path: 'login-failed',
      component: FailedComponent
  },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), canActivate: [MsalGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
