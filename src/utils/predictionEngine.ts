// ─── Linear Regression Prediction Engine ───────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
  r2: number;
  trend: "rising" | "falling" | "stable";
  trendPct: number; // % change from first to last historical point
}

/** Ordinary least-squares linear regression over an array of y-values (x = index). */
export function linearRegression(ys: number[]): RegressionResult {
  const n = ys.length;
  const sx = (n * (n - 1)) / 2;
  const sx2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const sy = ys.reduce((a, v) => a + v, 0);
  const sxy = ys.reduce((a, v, i) => a + i * v, 0);

  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;

  // R²
  const mu = sy / n;
  const tot = ys.reduce((a, v) => a + (v - mu) ** 2, 0);
  const res = ys.reduce((a, v, i) => a + (v - (slope * i + intercept)) ** 2, 0);
  const r2 = tot === 0 ? 1 : Math.max(0, 1 - res / tot);

  const first = intercept;
  const last = slope * (n - 1) + intercept;
  const trendPct = ((last - first) / Math.abs(first)) * 100;

  const trend: "rising" | "falling" | "stable" =
    Math.abs(trendPct) < 0.5 ? "stable" : trendPct > 0 ? "rising" : "falling";

  return { slope, intercept, predict: (x: number) => slope * x + intercept, r2, trend, trendPct };
}

/** Predict `n` steps ahead from the end of the historical series. */
export function forecast(ys: number[], steps: number): number[] {
  const { predict } = linearRegression(ys);
  return Array.from({ length: steps }, (_, i) => predict(ys.length + i));
}

/** Exponential smoothing layer on top of linear forecast (dampens residuals). */
export function smoothForecast(ys: number[], steps: number, alpha = 0.25): number[] {
  const raw = forecast(ys, steps);
  const last = ys[ys.length - 1];
  return raw.map((v, i) => {
    const weight = alpha * (i + 1);
    return v * (1 - weight * 0.05) + last * weight * 0.05;
  });
}
