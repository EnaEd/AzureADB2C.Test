import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { MsalModule } from '@azure/msal-angular';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    MsalModule
  ],
  exports:[ MaterialModule, MsalModule]
})
export class SharedModule { }
