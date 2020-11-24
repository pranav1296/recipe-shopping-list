import { Component, OnInit, OnDestroy} from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    userSubscription: Subscription;
    isAuthenticated = false;
    constructor(private dataStorageService: DataStorageService,
                private authService: AuthService) { }
    ngOnInit() {
        this.userSubscription = this.authService.user.subscribe(user => {
            this.isAuthenticated = !!user;
            console.log(!user);
            console.log(!!user);
        });
    }
    onLogout() {
        this.authService.logout();
    }
    onSaveData() {
        this.dataStorageService.storeRecipes();
    }
    onFetchData() {
        this.dataStorageService.fetchRecipes().subscribe();
    }
    ngOnDestroy() {
        this.userSubscription.unsubscribe();
    }
}
