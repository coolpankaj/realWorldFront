import { Injectable } from '@angular/core';
import { HttpClient, HttpParams , HttpErrorResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AppserviceService {

  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(public http: HttpClient, public cookie: CookieService) {}

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }
  public setUserInfoInLocalStorage = (data: any) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }

  signUp(data: any) {
    const params = new HttpParams()     
      .set('userName', data.userName)
      .set('password', data.password)
      .set('email', data.email)
      .set('name', data.name);
    return this.http.post(`${this.baseUrl}/users/signup`, params);
  }
  signinFunction(data: any) {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);
    return this.http.post(`${this.baseUrl}/users/login`, params);
  }
  public logout(data: any) {
    const params = new HttpParams()
      .set('authToken', data.authToken);
    return this.http.post(`${this.baseUrl}/users/${data.userId}/logout`, params);
  }

  public getChat(senderId, receiverId, skip): Observable<any> {
    // tslint:disable-next-line:max-line-length
    return this.http.get(`${this.baseUrl}/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${this.cookie.get('authToken')}`);
    // Handling Error
  }
 


  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError

 
}
