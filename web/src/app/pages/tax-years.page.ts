import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authGuard } from '../services/auth.guard';

export const routeMeta = {
  canActivate: [authGuard],
};

@Component({
  selector: 'app-tax-years-layout',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export default class TaxYearsLayoutComponent {}
