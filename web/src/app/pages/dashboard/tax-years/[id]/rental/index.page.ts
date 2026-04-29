import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../../../services/rental.service';
import { ConfirmDialogComponent } from '../../../../../components/confirm-dialog.component';

@Component({
  selector: 'app-rental-list',
  imports: [RouterLink, FormsModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-confirm-dialog
      [open]="deleteDialogOpen()"
      title="Delete Rental Property"
      message="This will permanently delete this rental property and all associated data."
      (confirm)="confirmDelete()"
      (cancel)="deleteDialogOpen.set(false)" />
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId]" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Rental Properties</h1>
        </div>

        <div class="flex justify-end mb-4">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'rental', 'new']"
             class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Add Property
          </a>
        </div>

        @if (rentalService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (rentalService.properties().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500">No rental properties yet.</p>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (property of rentalService.properties(); track property.id) {
              <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <button (click)="goToDetail(property.id)"
                        class="text-left flex-1 hover:text-blue-600">
                  <p class="font-medium text-gray-900">{{ property.address }}</p>
                </button>
                <div class="flex gap-2 ml-4">
                  <a [routerLink]="['/dashboard/tax-years', taxYearId, 'rental', property.id]"
                     class="text-blue-600 hover:text-blue-800 text-sm">View</a>
                  <button (click)="onDelete(property.id)"
                          class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export default class RentalListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  rentalService = inject(RentalService);

  taxYearId = '';
  deleteDialogOpen = signal(false);
  private pendingDeleteId = '';

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.rentalService.loadProperties(this.taxYearId);
  }

  goToDetail(propertyId: string) {
    this.router.navigate(['/dashboard/tax-years', this.taxYearId, 'rental', propertyId]);
  }

  onDelete(id: string) {
    this.pendingDeleteId = id;
    this.deleteDialogOpen.set(true);
  }

  async confirmDelete() {
    this.deleteDialogOpen.set(false);
    await this.rentalService.deleteProperty(this.taxYearId, this.pendingDeleteId);
    await this.rentalService.loadProperties(this.taxYearId);
  }
}
