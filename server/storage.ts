import { 
  users, 
  notifications, 
  chat,
  type User, 
  type InsertUser,
  type Notification,
  type InsertNotification,
  type Chat,
  type InsertChat
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: InsertUser): Promise<User | undefined>;
  updateUserBalance(id: number, type: 'tabungan' | 'deposito', amount: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Notification methods
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  getAllNotifications(): Promise<Notification[]>;
  deleteNotification(id: number): Promise<void>;
  
  // Chat methods
  getAllChatMessages(): Promise<Chat[]>;
  createChatMessage(message: InsertChat): Promise<Chat>;
  deleteChatMessage(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, type: 'tabungan' | 'deposito', amount: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(type === 'tabungan' ? { saldo_tabungan: amount } : { saldo_deposito: amount })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.tanggal));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async getAllChatMessages(): Promise<Chat[]> {
    return await db
      .select()
      .from(chat)
      .orderBy(desc(chat.waktu));
  }

  async createChatMessage(message: InsertChat): Promise<Chat> {
    const [newMessage] = await db
      .insert(chat)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.tanggal));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async deleteChatMessage(id: number): Promise<void> {
    await db.delete(chat).where(eq(chat.id, id));
  }

  async updateUser(id: number, userData: InsertUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
