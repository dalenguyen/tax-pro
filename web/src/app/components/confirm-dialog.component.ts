import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="cancel.emit()"></div>
        <div class="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
          <div class="flex items-start gap-4 mb-4">
            <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ title() }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ message() }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    (click)="cancel.emit()">
              Cancel
            </button>
            <button type="button"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                    (click)="confirm.emit()">
              Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  open = input(false);
  title = input('Delete item');
  message = input('This action cannot be undone.');
  confirm = output<void>();
  cancel = output<void>();
}
