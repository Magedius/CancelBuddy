import { 
  type Subscription, 
  type InsertSubscription, 
  type NotificationSettings, 
  type InsertNotificationSettings,
  type UserSession,
  type InsertUserSession,
  userSessions,
  subscriptions,
  notificationSettings
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User Sessions
  createUserSession(sessionKey: string): Promise<UserSession>;
  getUserSession(sessionKey: string): Promise<UserSession | undefined>;
  activateUserSession(sessionKey: string): Promise<UserSession | undefined>;
  
  // Subscriptions
  getSubscriptions(sessionKey: string): Promise<Subscription[]>;
  getSubscription(id: string, sessionKey: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription, sessionKey: string): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>, sessionKey: string): Promise<Subscription | undefined>;
  deleteSubscription(id: string, sessionKey: string): Promise<boolean>;
  
  // Notification Settings
  getNotificationSettings(sessionKey: string): Promise<NotificationSettings | undefined>;
  updateNotificationSettings(settings: Partial<InsertNotificationSettings>, sessionKey: string): Promise<NotificationSettings>;
}

export class DatabaseStorage implements IStorage {
  private calculateStatus(cancelByDate: Date | null, reminderDays: number): "safe" | "warning" | "urgent" {
    if (!cancelByDate) return "safe";
    
    const now = new Date();
    const endDate = new Date(cancelByDate);
    
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEnd <= 1) return "urgent";
    if (daysUntilEnd <= reminderDays) return "warning";
    return "safe";
  }

  async createUserSession(sessionKey: string): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values({ sessionKey, isActivated: false })
      .returning();
    return session;
  }

  async getUserSession(sessionKey: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionKey, sessionKey));
    return session || undefined;
  }

  async activateUserSession(sessionKey: string): Promise<UserSession | undefined> {
    const [session] = await db
      .update(userSessions)
      .set({ isActivated: true })
      .where(eq(userSessions.sessionKey, sessionKey))
      .returning();
    return session || undefined;
  }

  async getSubscriptions(sessionKey: string): Promise<Subscription[]> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) return [];

    const settings = await this.getNotificationSettings(sessionKey);
    const reminderDays = settings?.reminderDays || 3;

    const subs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.sessionId, session.id));

    return subs.map(sub => ({
      ...sub,
      status: this.calculateStatus(sub.cancelByDate, reminderDays)
    }));
  }

  async getSubscription(id: string, sessionKey: string): Promise<Subscription | undefined> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) return undefined;

    const settings = await this.getNotificationSettings(sessionKey);
    const reminderDays = settings?.reminderDays || 3;

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.sessionId, session.id)));

    if (!subscription) return undefined;

    return {
      ...subscription,
      status: this.calculateStatus(subscription.cancelByDate, reminderDays)
    };
  }

  async createSubscription(insertSubscription: InsertSubscription, sessionKey: string): Promise<Subscription> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) {
      throw new Error("Session not activated");
    }

    const settings = await this.getNotificationSettings(sessionKey);
    const reminderDays = settings?.reminderDays || 3;
    const status = this.calculateStatus(insertSubscription.cancelByDate, reminderDays);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        name: insertSubscription.name,
        plan: insertSubscription.plan,
        price: insertSubscription.price,
        currency: insertSubscription.currency,
        startDate: insertSubscription.startDate,
        cancelByDate: insertSubscription.cancelByDate,
        cancelUrl: insertSubscription.cancelUrl,
        logoUrl: insertSubscription.logoUrl,
        sessionId: session.id,
        // status lasketaan dynaamisesti, ei tallenneta tietokantaan
      })
      .returning();

    return {
      ...subscription,
      status
    };
  }

  async updateSubscription(id: string, updateData: Partial<InsertSubscription>, sessionKey: string): Promise<Subscription | undefined> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) return undefined;

    const settings = await this.getNotificationSettings(sessionKey);
    const reminderDays = settings?.reminderDays || 3;

    const [updated] = await db
      .update(subscriptions)
      .set(updateData)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.sessionId, session.id)))
      .returning();

    if (!updated) return undefined;

    return {
      ...updated,
      status: this.calculateStatus(updated.cancelByDate, reminderDays)
    };
  }

  async deleteSubscription(id: string, sessionKey: string): Promise<boolean> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) return false;

    const result = await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.sessionId, session.id)));

    return (result.rowCount || 0) > 0;
  }

  async getNotificationSettings(sessionKey: string): Promise<NotificationSettings | undefined> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) return undefined;

    // Try to get existing settings
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.sessionId, session.id));

    if (settings) {
      return settings;
    }

    // Create default settings if they don't exist
    const [newSettings] = await db
      .insert(notificationSettings)
      .values({
        sessionId: session.id,
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        whatsappEnabled: false,
        reminderDays: 3,
      })
      .returning();

    return newSettings;
  }

  async updateNotificationSettings(settings: Partial<InsertNotificationSettings>, sessionKey: string): Promise<NotificationSettings> {
    const session = await this.getUserSession(sessionKey);
    if (!session?.isActivated) {
      throw new Error("Session not activated");
    }

    // First ensure settings exist
    await this.getNotificationSettings(sessionKey);

    const [updated] = await db
      .update(notificationSettings)
      .set(settings)
      .where(eq(notificationSettings.sessionId, session.id))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();
