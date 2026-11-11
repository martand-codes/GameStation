import { api } from '../Api/Axios';

export interface SearchResultGame {
  id: string;
  title: string;
  highlightedTitle: string;
  genre: string;
  tags: string[];
  description: string;
  snippet: string;
  price: number;
  coverImageUrl?: string;
  developerName?: string;
  score: number;
  matchedFields: string[];
  matchedTerms: string[];
}

export interface SearchApiResponse {
  success: boolean;
  query: string;
  correctedQuery?: string;
  totalMatches: number;
  latencyMs: number;
  results: SearchResultGame[];
}

export const searchGamesAPI = async (
  query: string,
  options?: { limit?: number; fuzzy?: boolean }
): Promise<SearchApiResponse> => {
  const response = await api.get('/search', {
    params: {
      q: query,
      limit: options?.limit || 8,
      fuzzy: options?.fuzzy !== false,
    },
  });
  return response.data;
};

export const getSearchAutocompleteAPI = async (
  prefix: string,
  limit: number = 5
): Promise<{ success: boolean; prefix: string; suggestions: string[] }> => {
  const response = await api.get('/search/autocomplete', {
    params: { prefix, limit },
  });
  return response.data;
};

