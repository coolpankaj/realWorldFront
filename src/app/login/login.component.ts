import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AppserviceService } from './../appservice.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: any;
  password: any;

  constructor(
    private appService: AppserviceService,
    public toastr: ToastrManager,
    public router: Router,
    public cookie: CookieService
  ) { }

  ngOnInit() {
  }

  public signinFunction: any = () => {
    if (!this.email) {
      this.toastr.warningToastr('enter username');
    } else if (!this.password) {

      this.toastr.warningToastr('enter password');
    } else {

      const data = {
        email: this.email,
        password: this.password
      };
      this.appService.signinFunction(data).subscribe((apiResponse: any) => {
        if (apiResponse.status === 200) {
          
          this.cookie.set('authToken', apiResponse.data.authToken);
          this.cookie.set('receiverId', apiResponse.data.userDetails.userId);
          this.cookie.set('receiverName', apiResponse.data.userDetails.userName);
          this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails);
         // this.router.navigate(['/chat']);
          this.toastr.successToastr(apiResponse.message);
          
          this.router.navigate(['/home']);

        } else {
          this.toastr.errorToastr(apiResponse.message);
        }
      },
        (err) => {
          this.toastr.errorToastr('Invalid username or password');
        });

    }
  }

}
