import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  message!: string;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getProfile(environment.apiConfig.uri);
  }

  getProfile(url: string) {
    this.http.get<string>(url)
      .subscribe(message => {
        console.log(message);
        this.message = message;
      });
  }
}