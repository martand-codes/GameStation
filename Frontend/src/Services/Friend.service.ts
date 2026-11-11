import { api } from '../Api/Axios';

export interface FriendItem {
  friendshipId: string;
  id: string;
  username: string;
  role: string;
  friendsSince: string;
}

export interface PendingIncomingItem {
  friendshipId: string;
  sender: {
    id: string;
    username: string;
    role: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface PendingOutgoingItem {
  friendshipId: string;
  receiver: {
    id: string;
    username: string;
    role: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface FriendsDataResponse {
  friends: FriendItem[];
  pendingIncoming: PendingIncomingItem[];
  pendingOutgoing: PendingOutgoingItem[];
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
}

export const getFriendsAPI = async (): Promise<FriendsDataResponse> => {
  const response = await api.get('/friends');
  return response.data?.data;
};

export const sendFriendRequestAPI = async (username: string): Promise<{ success: boolean; message: string; friendship: any }> => {
  const response = await api.post('/friends/request', { username });
  return response.data;
};

export const respondToFriendRequestAPI = async (
  friendshipId: string,
  action: 'ACCEPT' | 'DECLINE'
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/friends/${friendshipId}/respond`, { action });
  return response.data;
};

export const removeFriendAPI = async (friendshipId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/friends/${friendshipId}`);
  return response.data;
};

export const getDirectMessagesAPI = async (friendId: string): Promise<DirectMessageItem[]> => {
  const response = await api.get(`/friends/${friendId}/messages`);
  return response.data?.data;
};

export const sendDirectMessageAPI = async (
  friendId: string,
  content: string
): Promise<DirectMessageItem> => {
  const response = await api.post(`/friends/${friendId}/messages`, { content });
  return response.data?.data;
};

