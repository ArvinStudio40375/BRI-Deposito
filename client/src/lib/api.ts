import { apiRequest } from "./queryClient";
import type { 
  LoginRequest, 
  AdminAccessRequest, 
  UpdateBalanceRequest,
  InsertNotification,
  InsertChat,
  User,
  Notification,
  Chat
} from "@shared/schema";

export const api = {
  // Authentication
  login: async (credentials: LoginRequest) => {
    const response = await apiRequest("POST", "/api/login", credentials);
    return response.json();
  },

  adminAccess: async (request: AdminAccessRequest) => {
    const response = await apiRequest("POST", "/api/admin/access", request);
    return response.json();
  },

  // User management
  getUser: async (id: number): Promise<User> => {
    const response = await apiRequest("GET", `/api/users/${id}`);
    return response.json();
  },

  updateUserBalance: async (id: number, balanceUpdate: UpdateBalanceRequest) => {
    const response = await apiRequest("PATCH", `/api/users/${id}/balance`, balanceUpdate);
    return response.json();
  },

  // Notifications
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await apiRequest("GET", `/api/users/${userId}/notifications`);
    return response.json();
  },

  createNotification: async (notification: InsertNotification) => {
    const response = await apiRequest("POST", "/api/notifications", notification);
    return response.json();
  },

  // Chat
  getChatMessages: async (): Promise<Chat[]> => {
    const response = await apiRequest("GET", "/api/chat");
    return response.json();
  },

  sendChatMessage: async (message: InsertChat) => {
    const response = await apiRequest("POST", "/api/chat", message);
    return response.json();
  },

  // Initialize database
  initializeDatabase: async () => {
    const response = await apiRequest("POST", "/api/init");
    return response.json();
  },

  // Admin database management
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/api/admin/users");
    return response.json();
  },

  getAllNotifications: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/api/admin/notifications");
    return response.json();
  },

  getAllChatMessages: async (): Promise<Chat[]> => {
    const response = await apiRequest("GET", "/api/admin/chat-messages");
    return response.json();
  },

  deleteUser: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
    return response.json();
  },

  deleteNotification: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/admin/notifications/${id}`);
    return response.json();
  },

  deleteChatMessage: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/admin/chat/${id}`);
    return response.json();
  },

  createUser: async (userData: any) => {
    const response = await apiRequest("POST", "/api/admin/users", userData);
    return response.json();
  },

  updateUser: async (id: number, userData: any) => {
    const response = await apiRequest("PUT", `/api/admin/users/${id}`, userData);
    return response.json();
  }
};
