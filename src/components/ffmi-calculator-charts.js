"use client";

import {
    renderLineChart,
    renderWeightLossChart,
} from './ffmi-calculator-chart-ui';

export default function CalculatorCharts({
    chartData,
    projectedMetrics,
    validMetrics,
}) {
    return (
        <div className={validMetrics
            ? "grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6"
            : "grid grid-cols-1 gap-6"
        }>
            {renderLineChart(chartData, projectedMetrics, Boolean(validMetrics))}
            {validMetrics && renderWeightLossChart(validMetrics)}
        </div>
    );
}
