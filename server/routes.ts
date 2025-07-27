import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema, insertNotificationSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {


  // Create or get user session
  app.post("/api/session/create", async (req, res) => {
    try {
      const sessionKey = randomUUID();
      const session = await storage.createUserSession(sessionKey);
      
      res.cookie('sessionKey', sessionKey, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: false 
      });
      
      res.json({ sessionKey, session });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Get session status
  app.get("/api/session", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.json({ sessionKey: null, session: null });
      }

      const session = await storage.getUserSession(sessionKey);
      res.json({ sessionKey, session });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  // Activate user session
  app.post("/api/session/activate", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(400).json({ message: "No session key provided" });
      }

      const session = await storage.activateUserSession(sessionKey);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error('Activate session error:', error);
      res.status(500).json({ message: "Failed to activate session" });
    }
  });

  // Get all subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.json([]);
      }

      const subscriptions = await storage.getSubscriptions(sessionKey);
      res.json(subscriptions);
    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Get single subscription
  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(401).json({ message: "No session" });
      }

      const subscription = await storage.getSubscription(req.params.id, sessionKey);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Create new subscription
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(401).json({ message: "No session" });
      }

      // Convert data types from form strings to proper types
      if (req.body.startDate && typeof req.body.startDate === 'string') {
        req.body.startDate = new Date(req.body.startDate);
      }
      if (req.body.price && typeof req.body.price === 'string') {
        req.body.price = parseFloat(req.body.price);
      }
      if (req.body.cancelByDate && typeof req.body.cancelByDate === 'string') {
        req.body.cancelByDate = new Date(req.body.cancelByDate);
      }

      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData, sessionKey);
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Create subscription error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Update subscription
  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(401).json({ message: "No session" });
      }

      // Convert data types from form strings to proper types
      if (req.body.startDate && typeof req.body.startDate === 'string') {
        req.body.startDate = new Date(req.body.startDate);
      }
      if (req.body.price && typeof req.body.price === 'string') {
        req.body.price = parseFloat(req.body.price);
      }
      if (req.body.cancelByDate && typeof req.body.cancelByDate === 'string') {
        req.body.cancelByDate = new Date(req.body.cancelByDate);
      }

      const partialSchema = insertSubscriptionSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const subscription = await storage.updateSubscription(req.params.id, validatedData, sessionKey);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Update subscription error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Delete subscription
  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(401).json({ message: "No session" });
      }

      const success = await storage.deleteSubscription(req.params.id, sessionKey);
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete subscription error:', error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Get notification settings
  app.get("/api/settings", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.json(null);
      }

      const settings = await storage.getNotificationSettings(sessionKey);
      res.json(settings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update notification settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const sessionKey = req.cookies?.sessionKey || req.headers['x-session-key'];
      
      if (!sessionKey) {
        return res.status(401).json({ message: "No session" });
      }

      const partialSchema = insertNotificationSettingsSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const settings = await storage.updateNotificationSettings(validatedData, sessionKey);
      res.json(settings);
    } catch (error) {
      console.error('Update settings error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
