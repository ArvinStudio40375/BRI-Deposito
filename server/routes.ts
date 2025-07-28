import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  adminAccessSchema, 
  updateBalanceSchema,
  insertNotificationSchema,
  insertChatSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, pin } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.pin !== pin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, pin: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Admin access endpoint
  app.post("/api/admin/access", async (req, res) => {
    try {
      const { code } = adminAccessSchema.parse(req.body);
      
      if (code !== "011090") {
        return res.status(401).json({ message: "Invalid admin code" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, pin: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Update user balance (admin only)
  app.patch("/api/users/:id/balance", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { amount, type } = updateBalanceSchema.parse(req.body);
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentAmount = type === 'tabungan' ? user.saldo_tabungan : user.saldo_deposito;
      const newAmount = currentAmount + amount;

      const updatedUser = await storage.updateUserBalance(id, type, newAmount);
      res.json({ ...updatedUser, pin: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get notifications for user
  app.get("/api/users/:id/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userNotifications = await storage.getNotificationsByUserId(userId);
      res.json(userNotifications);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Create notification (admin only)
  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get all chat messages
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Create chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Database management endpoints for admin
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, pin: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/admin/chat-messages", async (req, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete("/api/admin/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.delete("/api/admin/chat/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatMessage(id);
      res.json({ message: "Chat message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chat message" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await storage.createUser({
        username: userData.username,
        pin: userData.pin,
        saldo_tabungan: parseInt(userData.saldo_tabungan),
        saldo_deposito: parseInt(userData.saldo_deposito)
      });
      res.json({ ...newUser, pin: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, {
        username: userData.username,
        pin: userData.pin,
        saldo_tabungan: parseInt(userData.saldo_tabungan),
        saldo_deposito: parseInt(userData.saldo_deposito)
      });
      res.json({ ...updatedUser, pin: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Initialize default user if not exists
  app.post("/api/init", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername("Siti Aminah");
      
      if (!existingUser) {
        const user = await storage.createUser({
          username: "Siti Aminah",
          pin: "112233",
          saldo_tabungan: 1100000,
          saldo_deposito: 200350000
        });

        // Create default notifications
        await storage.createNotification({
          user_id: user.id,
          isi: "Selamat datang di Deposit BRI",
          tipe: "info"
        });

        await storage.createNotification({
          user_id: user.id,
          isi: "Harap segera top up tabungan",
          tipe: "popup"
        });

        // Create default admin chat message
        await storage.createChatMessage({
          sender: "admin",
          message: "Selamat datang di layanan chat BRI. Ada yang bisa kami bantu?"
        });

        res.json({ message: "Database initialized", user: { ...user, pin: undefined } });
      } else {
        res.json({ message: "Database already initialized" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
