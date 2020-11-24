import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthInterface } from './auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent {
    isLogin = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective, { static: false }) alertHost: PlaceholderDirective;
    constructor(private authService: AuthService, private router: Router,
                private componentFactoryResolver: ComponentFactoryResolver) { }
    onSwitchMode() {
        this.isLogin = !this.isLogin;
    }
    onSubmit(loginForm: NgForm) {
        if (!loginForm.valid) {
            return;
        }
        const email = loginForm.value.email;
        const password = loginForm.value.password;
        let authObs: Observable<AuthInterface>;

        this.isLoading = true;
        if (this.isLogin) {
            authObs = this.authService.login(email, password);
        } else {
            authObs = this.authService.signUp(email, password);
        }
        authObs.subscribe(
            response => {
                this.router.navigate(['/recipes']);
                this.isLoading = false;
            },
            errorMsg => {
                this.error = errorMsg;
                this.showErrorAlert(errorMsg);
                this.isLoading = false;
            }
        );
        loginForm.reset();
    }
    showErrorAlert(message: string) {
        // accessing your alert component through component factory resolver provided by angular
        const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
        // accessing the view continer ref
        const hostContainerViewRef = this.alertHost.viewContainerRef;
        // clearing the viewContainerRef if it was rendered before 
        hostContainerViewRef.clear();
        // creating the component
        hostContainerViewRef.createComponent(alertCmpFactory);
    }
    onHandleError() {
        this.error = null;
    }
}
