import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

export const routeMeta = {
  title: 'Tax Years | Can Tax Pro',
};

@Component({
  selector: 'app-tax-years-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export default class TaxYearsLayoutComponent {}
