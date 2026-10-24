import { api } from '../Api/Axios';

export const recordPlaytimeAPI = async (
  gameId: string,
  additionalSeconds: number
): Promise<{
  success: boolean;
  message: string;
  data: {
    gameId: string;
    totalPlayTime: number;
    lastPlayed: string;
  };
}> => {
  const response = await api.post('/telemetry/playtime', {
    gameId,
    additionalSeconds,
  });
  return response.data;
};
