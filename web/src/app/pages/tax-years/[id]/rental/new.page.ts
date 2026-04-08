import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../../services/rental.service';

@Component({
  selector: 'app-rental-new',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/tax-years', taxYearId, 'rental']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Add Rental Property</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input type="text" [(ngModel)]="address" name="address" required
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="123 Main St, City, Province" />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit"
                      class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm"
                      [disabled]="submitting()">
                {{ submitting() ? 'Saving...' : 'Save' }}
              </button>
              <a [routerLink]="['/tax-years', taxYearId, 'rental']"
                 class="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200 text-sm">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export default class RentalNewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rentalService = inject(RentalService);

  taxYearId = '';
  address = '';
  submitting = signal(false);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }

  async onSubmit() {
    this.submitting.set(true);
    try {
      const property = await this.rentalService.createProperty(this.taxYearId, { address: this.address });
      this.router.navigate(['/tax-years', this.taxYearId, 'rental', property.id]);
    } finally {
      this.submitting.set(false);
    }
  }
}
