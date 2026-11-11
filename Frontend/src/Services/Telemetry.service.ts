import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Span {
  spanId: string;
  parentSpanId?: string;
  traceId: string;
  name: string;
  category: 'HTTP' | 'DB' | 'SEARCH' | 'SAGA' | 'COMPUTE' | 'INTERNAL';
  startTime: number;
  endTime?: number;
  durationMs: number;
  status: 'OK' | 'ERROR';
  attributes: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface TraceItem {
  traceId: string;
  rootSpan: Span;
  spans: Span[];
  startTime: number;
  endTime: number;
  durationMs: number;
  hasErrors: boolean;
  tags: {
    route?: string;
    method?: string;
    statusCode?: number;
    gameId?: string;
    studioId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface TelemetryMetrics {
  totalTraces: number;
  activeSpansCount: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  avgDurationMs: number;
  errorRatePercent: number;
  categoryBreakdown: Record<string, { count: number; avgDurationMs: number; totalDurationMs: number }>;
  slowestTraces: Array<{
    traceId: string;
    name: string;
    durationMs: number;
    route?: string;
    statusCode?: number;
  }>;
}

export interface FetchTracesResponse {
  success: boolean;
  total: number;
  count: number;
  limit: number;
  offset: number;
  traces: TraceItem[];
}

export const getTelemetryTracesAPI = async (params: {
  status?: string;
  category?: string;
  minDurationMs?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<FetchTracesResponse> => {
  const response = await api.get('/telemetry/traces', { params });
  return response.data;
};

export const getTelemetryTraceByIdAPI = async (traceId: string): Promise<TraceItem> => {
  const response = await api.get(`/telemetry/traces/${traceId}`);
  return response.data.trace;
};

export const getTelemetryMetricsAPI = async (): Promise<{ role: string; metrics: TelemetryMetrics }> => {
  const response = await api.get('/telemetry/metrics');
  return response.data;
};

export const recordPlaytimeAPI = async (gameId: string, additionalSeconds: number): Promise<any> => {
  const response = await api.post('/telemetry/playtime', { gameId, additionalSeconds });
  return response.data;
};
