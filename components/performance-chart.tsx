type ChartPoint = {
  date: string;
  deposits: number;
  profits: number;
  total: number;
};

type PerformanceChartProps = {
  data: ChartPoint[];
};

function createPoints(
  values: number[],
  highestValue: number
) {
  const width = 700;
  const height = 230;
  const horizontalPadding = 24;
  const verticalPadding = 20;

  if (values.length === 1) {
    const y =
      height -
      verticalPadding -
      (values[0] / highestValue) *
        (height - verticalPadding * 2);

    return `${width / 2},${y}`;
  }

  return values
    .map((value, index) => {
      const x =
        horizontalPadding +
        (index / (values.length - 1)) *
          (width - horizontalPadding * 2);

      const y =
        height -
        verticalPadding -
        (value / highestValue) *
          (height - verticalPadding * 2);

      return `${x},${y}`;
    })
    .join(" ");
}

export function PerformanceChart({
  data,
}: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <span>No performance activity yet</span>

        <p>
          Approved deposits and awarded profits will
          appear on this chart.
        </p>
      </div>
    );
  }

  const highestValue = Math.max(
    ...data.map((item) =>
      Math.max(item.deposits, item.profits)
    ),
    1
  );

  const depositPoints = createPoints(
    data.map((item) => item.deposits),
    highestValue
  );

  const profitPoints = createPoints(
    data.map((item) => item.profits),
    highestValue
  );

  return (
    <div className="performance-chart">
      <div className="chart-legend">
        <span>
          <i className="legend-dot deposit-dot" />
          Deposits
        </span>

        <span>
          <i className="legend-dot profit-dot" />
          Profits
        </span>
      </div>

      <div className="chart-canvas">
        <svg
          viewBox="0 0 700 230"
          role="img"
          aria-label="Deposit and profit performance chart"
        >
          <line
            x1="24"
            y1="20"
            x2="24"
            y2="210"
            className="chart-axis"
          />

          <line
            x1="24"
            y1="210"
            x2="676"
            y2="210"
            className="chart-axis"
          />

          <line
            x1="24"
            y1="68"
            x2="676"
            y2="68"
            className="chart-grid-line"
          />

          <line
            x1="24"
            y1="116"
            x2="676"
            y2="116"
            className="chart-grid-line"
          />

          <line
            x1="24"
            y1="164"
            x2="676"
            y2="164"
            className="chart-grid-line"
          />

          <polyline
            points={depositPoints}
            className="chart-line deposit-line"
          />

          <polyline
            points={profitPoints}
            className="chart-line profit-line"
          />
        </svg>
      </div>

      <div className="chart-period">
        <span>
          {new Date(
            data[0].date
          ).toLocaleDateString()}
        </span>

        <span>
          {new Date(
            data[data.length - 1].date
          ).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}