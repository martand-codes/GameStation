import { api } from '../Api/Axios';

export interface GameReviewItem {
  id: string;
  gameId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
  overallRating: number;
  headline?: string | null;
  content: string;
  optimization?: number | null;
  funFactor?: number | null;
  soundDesign?: number | null;
  visuals?: number | null;
  stabilityNetcode?: number | null;
  playtimeAtReview: number;
  isVerifiedOwner: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  userVote?: boolean | null;
  developerResponse?: string | null;
  developerRespondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameReviewsResponse {
  gameId: string;
  gameTitle: string;
  summary: {
    totalReviews: number;
    averageRating: number;
    sentiment: string;
    ratingDistribution: Record<number, number>;
    deepDiveAverages: {
      optimization: number | null;
      funFactor: number | null;
      soundDesign: number | null;
      visuals: number | null;
      stabilityNetcode: number | null;
    };
  };
  userStatus: {
    isOwner: boolean;
    playTimeSeconds: number;
    hasReviewed: boolean;
    userReview: GameReviewItem | null;
  };
  reviews: GameReviewItem[];
}

export interface SubmitReviewPayload {
  gameId: string;
  overallRating: number;
  headline?: string;
  content: string;
  optimization?: number;
  funFactor?: number;
  soundDesign?: number;
  visuals?: number;
  stabilityNetcode?: number;
}

export const getGameReviewsAPI = async (
  gameId: string,
  sortBy: 'helpful' | 'recent' | 'highest' | 'lowest' = 'helpful'
): Promise<GameReviewsResponse> => {
  const response = await api.get(`/reviews/game/${gameId}`, {
    params: { sortBy },
  });
  return response.data?.data;
};

export const voteReviewAPI = async (
  reviewId: string,
  isHelpful: boolean
): Promise<{
  success: boolean;
  userVote: boolean | null;
  helpfulCount: number;
  unhelpfulCount: number;
}> => {
  const response = await api.post(`/reviews/${reviewId}/vote`, { isHelpful });
  return response.data;
};

export const submitReviewAPI = async (
  payload: SubmitReviewPayload
): Promise<{ success: boolean; data: GameReviewItem }> => {
  const response = await api.post('/reviews', payload);
  return response.data;
};

export const deleteReviewAPI = async (
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export interface StudioReviewItem extends GameReviewItem {
  game: {
    id: string;
    title: string;
    developer: { id: string; username: string };
    media?: { coverImageUrl: string };
  };
}

export interface StudioReviewsFeedResponse {
  reviews: StudioReviewItem[];
  summary: {
    totalReviews: number;
    averageRating: number;
    sentiment: string;
    unansweredCount: number;
    ratingDistribution: Record<number, number>;
    deepDiveAverages: {
      optimization: number | null;
      funFactor: number | null;
      soundDesign: number | null;
      visuals: number | null;
      stabilityNetcode: number | null;
    };
  };
  gamesList: Array<{
    id: string;
    title: string;
    genre: string;
    developerId: string;
    developer: { id: string; username: string };
    media?: { coverImageUrl: string };
  }>;
}

export const getStudioReviewsAPI = async (
  studioId?: string,
  gameId?: string
): Promise<StudioReviewsFeedResponse> => {
  const params: any = {};
  if (studioId && studioId !== 'ALL') params.studioId = studioId;
  if (gameId && gameId !== 'ALL') params.gameId = gameId;
  const response = await api.get('/reviews/studio/feed', { params });
  return response.data?.data;
};

export const replyToReviewAPI = async (
  reviewId: string,
  response: string
): Promise<{ success: boolean; message: string; data: GameReviewItem }> => {
  const res = await api.post(`/reviews/${reviewId}/response`, { response });
  return res.data;
};

export const deleteReplyAPI = async (
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/reviews/${reviewId}/response`);
  return res.data;
};


