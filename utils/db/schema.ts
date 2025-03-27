import { integer, pgTable, text, timestamp, time, boolean, date } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    plan: text('plan').notNull(),
    plan_name: text('plan_name').default('Basic Plan'),
    stripe_id: text('stripe_id').notNull(),
    avatar_url: text('avatar_url'),
    theme_preference: text('theme_preference').default('light'),
    push_notifications_enabled: boolean('push_notifications_enabled').default(false),
    email_notifications_enabled: boolean('email_notifications_enabled').default(true),
    new_workout_notifications: boolean('new_workout_notifications').default(true),
    new_workout_notification_time: text('new_workout_notification_time').default('08:00'),
    workout_reminder_enabled: boolean('workout_reminder_enabled').default(false),
    workout_reminder_time: text('workout_reminder_time').default('17:00'),
    gender: text('gender'),
    birthday: date('birthday'),
    location: text('location'),
});

export const facialProgressPhotosTable = pgTable('facial_progress_photos', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull().references(() => usersTable.id),
    photo_url: text('photo_url').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    lighting_score: integer('lighting_score'),
    alignment_score: integer('alignment_score'),
    notes: text('notes'),
    metadata: text('metadata'), // JSON string with additional metadata
});

export const pushSubscriptionsTable = pgTable('push_subscriptions', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull().references(() => usersTable.id),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const bookmarksTable = pgTable('bookmarks', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull().references(() => usersTable.id),
    workout_id: text('workout_id').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertFacialProgressPhoto = typeof facialProgressPhotosTable.$inferInsert;
export type SelectFacialProgressPhoto = typeof facialProgressPhotosTable.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptionsTable.$inferInsert;
export type SelectPushSubscription = typeof pushSubscriptionsTable.$inferSelect;
export type InsertBookmark = typeof bookmarksTable.$inferInsert;
export type SelectBookmark = typeof bookmarksTable.$inferSelect;
