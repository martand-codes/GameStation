import { api } from '../Api/Axios';

export interface LibraryItem {
  libraryId: string;
  acquiredAt: string;
  playTime?: number;
  lastPlayed?: string | null;
  ownedPricing?: {
    id: string;
    editionName: string;
    features: string[];
    isFree: boolean;
    price: number | string;
    currency: string;
  } | null;
  latestPayment?: {
    id: string;
    gameId: string;
    amount: number | string;
    currency: string;
    providerPaymentId?: string | null;
    createdAt: string;
  } | null;
  game: {
    id: string;
    title: string;
    genre: string;
    description: string;
    tags: string[];
    media?: {
      coverImageUrl?: string;
      bannerImageUrl?: string;
      screenshots?: string[];
      trailerUrl?: string;
    } | null;
    pricing?: Array<{
      id: string;
      editionName: string;
      price: number | string;
      isFree: boolean;
      currency: string;
    }>;
    requirements?: {
      minOs: string;
      minCpu: string;
      minGpu: string;
      minMem: string;
      minStorage: string;
      optOs: string;
      optCpu: string;
      optGpu: string;
      optMem: string;
      optStorage: string;
    } | null;
    telemetry?: {
      mainStoryHours?: number;
      mainExtrasHours?: number;
      completionistHours?: number;
    } | null;
    developer?: {
      id: string;
      username: string;
    } | null;
    versions?: Array<{
      id: string;
      version: string;
      downloadUrl?: string;
      changelog?: string;
      createdAt: string;
    }>;
  };
}

export const getPlayerLibraryAPI = async (): Promise<{ success: boolean; data: LibraryItem[] }> => {
  const response = await api.get('/payments/library');
  return response.data;
};
