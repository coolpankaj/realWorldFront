import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';
import { AppserviceService } from './../appservice.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor( public fb: FormBuilder,
    public toastr: ToastrManager,
    public router: Router,
    public appService: AppserviceService) { }

    signupForm = this.fb.group({     
      name: [null, Validators.required],
      userName: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.required]     
    });

  ngOnInit() {
  }
  onSubmit() {
    this.appService.signUp(this.signupForm.value).subscribe((apiResponse: any) => {
        if (apiResponse.status === 200) {
          this.toastr.successToastr(' ! SignUp Successful');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.toastr.errorToastr(apiResponse.message);
        }
      }, (err) => {
        this.toastr.errorToastr(`${err.message}`);
      });
  }

}
