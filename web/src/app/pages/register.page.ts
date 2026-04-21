import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: '',
})
export default class RegisterComponent {
  constructor() {
    inject(Router).navigateByUrl('/login', { replaceUrl: true });
  }
}
