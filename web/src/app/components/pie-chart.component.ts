import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface PieSlice {
  label: string;
  value: number;
}

interface RenderedSlice {
  label: string;
  value: number;
  color: string;
  path: string;
  percent: number;
}

const PALETTE = [
  '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#9333ea',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#475569',
];

@Component({
  selector: 'app-pie-chart',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (total() === 0) {
      <p class="text-sm text-gray-400">No data</p>
    } @else {
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="-1.1 -1.1 2.2 2.2" class="w-40 h-40 shrink-0" aria-label="Pie chart">
          @for (slice of slices(); track slice.label) {
            <path [attr.d]="slice.path" [attr.fill]="slice.color" stroke="white" stroke-width="0.02" />
          }
        </svg>
        <ul class="text-xs space-y-1 flex-1 min-w-0 w-full">
          @for (slice of slices(); track slice.label) {
            <li class="flex items-center gap-2">
              <span class="inline-block w-3 h-3 rounded-sm shrink-0" [style.background]="slice.color"></span>
              <span class="text-gray-700 truncate flex-1">{{ slice.label }}</span>
              <span class="text-gray-500 font-mono">
                \${{ slice.value | number:'1.0-0' }}
                ({{ slice.percent | number:'1.0-1' }}%)
              </span>
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class PieChartComponent {
  data = input.required<PieSlice[]>();

  total = computed(() =>
    this.data().reduce((sum, s) => sum + Math.max(0, s.value), 0)
  );

  slices = computed<RenderedSlice[]>(() => {
    const entries = this.data().filter((s) => s.value > 0);
    const total = entries.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) return [];

    // Single-slice case: draw a full circle as two half-arcs to avoid
    // the degenerate arc where start and end points coincide.
    if (entries.length === 1) {
      return [
        {
          label: entries[0].label,
          value: entries[0].value,
          color: PALETTE[0],
          percent: 100,
          path: 'M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z',
        },
      ];
    }

    let start = 0;
    return entries.map((slice, i) => {
      const fraction = slice.value / total;
      const end = start + fraction;
      const path = describeArc(start, end);
      start = end;
      return {
        label: slice.label,
        value: slice.value,
        color: PALETTE[i % PALETTE.length],
        percent: fraction * 100,
        path,
      };
    });
  });
}

function describeArc(startFraction: number, endFraction: number): string {
  const startAngle = startFraction * 2 * Math.PI - Math.PI / 2;
  const endAngle = endFraction * 2 * Math.PI - Math.PI / 2;
  const x1 = Math.cos(startAngle);
  const y1 = Math.sin(startAngle);
  const x2 = Math.cos(endAngle);
  const y2 = Math.sin(endAngle);
  const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;
  return `M 0 0 L ${x1.toFixed(4)} ${y1.toFixed(4)} A 1 1 0 ${largeArc} 1 ${x2.toFixed(4)} ${y2.toFixed(4)} Z`;
}
