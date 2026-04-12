import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface LineSeries {
  label: string;
  color: string;
  points: number[]; // aligned with `labels` input
}

@Component({
  selector: 'app-line-chart',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (labels().length === 0) {
      <p class="text-sm text-gray-400">No data</p>
    } @else {
      <svg [attr.viewBox]="viewBox()" class="w-full h-48" preserveAspectRatio="none" aria-label="Line chart">
        <!-- axes -->
        <line [attr.x1]="paddingLeft" [attr.y1]="paddingTop" [attr.x2]="paddingLeft" [attr.y2]="innerBottom"
              stroke="#e5e7eb" stroke-width="1" />
        <line [attr.x1]="paddingLeft" [attr.y1]="innerBottom" [attr.x2]="innerRight" [attr.y2]="innerBottom"
              stroke="#e5e7eb" stroke-width="1" />

        @for (s of renderedSeries(); track s.label) {
          <polyline fill="none" [attr.stroke]="s.color" stroke-width="2" [attr.points]="s.points" />
        }

        @for (label of labels(); track label; let i = $index) {
          <text [attr.x]="xAt(i)" [attr.y]="innerBottom + 14" text-anchor="middle"
                font-size="10" fill="#6b7280">
            {{ label }}
          </text>
        }
      </svg>
      <div class="flex gap-4 mt-2 text-xs">
        @for (s of series(); track s.label) {
          <div class="flex items-center gap-1">
            <span class="inline-block w-3 h-3 rounded-sm" [style.background]="s.color"></span>
            <span class="text-gray-700">{{ s.label }}</span>
            <span class="text-gray-400 font-mono">(max \${{ seriesMax(s.points) | number:'1.0-0' }})</span>
          </div>
        }
      </div>
    }
  `,
})
export class LineChartComponent {
  labels = input.required<string[]>();
  series = input.required<LineSeries[]>();

  readonly width = 600;
  readonly height = 220;
  readonly paddingLeft = 48;
  readonly paddingRight = 12;
  readonly paddingTop = 12;
  readonly paddingBottom = 28;

  get innerRight() { return this.width - this.paddingRight; }
  get innerBottom() { return this.height - this.paddingBottom; }

  viewBox = computed(() => `0 0 ${this.width} ${this.height}`);

  max = computed(() => {
    let m = 0;
    for (const s of this.series()) {
      for (const p of s.points) m = Math.max(m, p);
    }
    return m;
  });

  xAt(i: number): number {
    const n = this.labels().length;
    if (n <= 1) return (this.paddingLeft + this.innerRight) / 2;
    const span = this.innerRight - this.paddingLeft;
    return this.paddingLeft + (span * i) / (n - 1);
  }

  yAt(v: number): number {
    const max = this.max();
    if (max <= 0) return this.innerBottom;
    const span = this.innerBottom - this.paddingTop;
    return this.innerBottom - (v / max) * span;
  }

  renderedSeries = computed(() =>
    this.series().map((s) => ({
      label: s.label,
      color: s.color,
      points: s.points.map((p, i) => `${this.xAt(i).toFixed(1)},${this.yAt(p).toFixed(1)}`).join(' '),
    }))
  );

  seriesMax(points: number[]): number {
    return points.reduce((m, p) => Math.max(m, p), 0);
  }
}
