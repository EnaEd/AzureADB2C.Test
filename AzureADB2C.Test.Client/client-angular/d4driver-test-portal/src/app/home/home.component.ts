import { Component, OnInit } from "@angular/core";
import { AccountService } from "../shared/providers/services";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
  })
export class HomeComponent implements OnInit {
    loginDisplay = false;
    displayedColumns: string[] = ['claim', 'value'];
    dataSource: any = [];
  

    constructor(private readonly _accountService: AccountService) { }

    ngOnInit(): void {
      debugger
        this.dataSource = this._accountService.claims;
    }

      
}