export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, message: string, detail: string = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const MODEL_SERVICE_URL =
  process.env.NEXT_PUBLIC_MODEL_SERVICE_URL || "http://localhost:8000";
const ESTIMATOR_URL =
  process.env.NEXT_PUBLIC_ESTIMATOR_URL || "http://localhost:8001";
const MARKET_URL =
  process.env.NEXT_PUBLIC_MARKET_URL || "http://localhost:8080";

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.detail || body.error || "";
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, `Request failed: ${res.statusText}`, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.set(key, String(value));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ── Model Service ────────────────────────────────────────────

export interface ModelInfo {
  model_type: string;
  features: string[];
  metrics: { r2: number; rmse: number; mae: number };
  feature_importances: Record<string, number>;
  coefficients: number[] | null;
}

export async function getModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>(`${MODEL_SERVICE_URL}/model-info`);
}

// ── Estimator Backend (snake_case) ───────────────────────────

export interface EstimateResponse {
  predicted_price: number;
  saved: boolean;
}

export interface HistoryItem {
  id: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  predicted_price: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function submitEstimate(
  features: Record<string, number>,
  signal?: AbortSignal
): Promise<EstimateResponse> {
  return request<EstimateResponse>(`${ESTIMATOR_URL}/api/estimate`, {
    method: "POST",
    body: JSON.stringify(features),
    signal,
  });
}

export async function getHistory(
  page: number,
  pageSize: number,
  sortBy?: string,
  sortOrder?: string,
  signal?: AbortSignal
): Promise<HistoryListResponse> {
  return request<HistoryListResponse>(
    `${ESTIMATOR_URL}/api/history${qs({ page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder })}`,
    { signal }
  );
}

export async function getHistoryItem(id: number): Promise<HistoryItem> {
  return request<HistoryItem>(`${ESTIMATOR_URL}/api/history/${id}`);
}

export async function deleteHistoryItem(id: number): Promise<void> {
  return request<void>(`${ESTIMATOR_URL}/api/history/${id}`, {
    method: "DELETE",
  });
}

// ── Market Backend (camelCase) ───────────────────────────────

export interface MarketStatsResponse {
  totalProperties: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgSquareFootage: number;
  avgYearBuilt: number;
  avgLotSize: number;
  avgDistanceToCityCenter: number;
  avgSchoolRating: number;
  avgPriceByBedrooms: Record<string, number>;
  priceDistribution: { range: string; count: number }[];
  propertyCountByYearRange: Record<string, number>;
}

export interface PropertyResponse {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}

export interface BreakdownPageResponse {
  items: PropertyResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WhatIfResponse {
  predictedPrice: number;
}

export async function getMarketSummary(
  filters: Record<string, unknown>
): Promise<MarketStatsResponse> {
  return request<MarketStatsResponse>(
    `${MARKET_URL}/api/market/summary${qs(filters)}`
  );
}

export async function getMarketBreakdown(
  filters: Record<string, unknown>,
  signal?: AbortSignal
): Promise<BreakdownPageResponse> {
  return request<BreakdownPageResponse>(
    `${MARKET_URL}/api/market/breakdown${qs(filters)}`,
    { signal }
  );
}

export async function submitWhatIf(
  features: Record<string, number>
): Promise<WhatIfResponse> {
  return request<WhatIfResponse>(`${MARKET_URL}/api/market/what-if`, {
    method: "POST",
    body: JSON.stringify(features),
  });
}

export function getExportUrl(
  filters: Record<string, unknown>,
  format: "csv" | "pdf"
): string {
  return `${MARKET_URL}/api/market/breakdown/export${qs({ ...filters, format })}`;
}
