import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthInterface {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  expirationTime: any;
  constructor(private http: HttpClient, private router: Router) {}
  signUp(email: string, password: string) {
      return this.http
          .post<AuthInterface>(
              'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDBoU383pxhhlWsL2vDtlc940Lt6pbsA_Q',
              {
                  email,
                  password,
                  returnSecureToken: true,
              }
          )
        .pipe(catchError(this.handleError), tap(resData => {
          this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
          }));
  }
  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
  login(email: string, password: string) {
    return this.http.post<AuthInterface>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDBoU383pxhhlWsL2vDtlc940Lt6pbsA_Q',
      {
        email,
        password,
        returnSecureToken: true,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }
  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const loadedUser = new User(userData.email, userData.id,
      userData._token, new Date(userData._tokenExpirationDate));
    if (loadedUser.token) {
      const expirationTime = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationTime);
      this.user.next(loadedUser);
    }

  }
  logout() {
    this.user.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('userData');
    if (this.expirationTime) {
      clearTimeout(this.expirationTime);
    }
    this.expirationTime = null;
  }
  autoLogout(expirationTime: number) {
    this.expirationTime = setTimeout(() => {
      this.logout();
    }, expirationTime);
  }
  private handleError(errorRes: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMsg);
    }
    switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
            errorMsg = 'This email already exists';
            break;
        case 'EMAIL_NOT_FOUND':
        case 'INVALID_PASSWORD':
            {
                errorMsg = 'Email or Password is incorrect';
                break;
            }
        case 'USER_DISABLED':
            errorMsg = 'Your account is locked. Check with your administrator';
            break;
    }
    return throwError(errorMsg);
  }
}
