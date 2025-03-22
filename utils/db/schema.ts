import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    plan: text('plan').notNull(),
    plan_name: text('plan_name').default('Basic Plan'),
    stripe_id: text('stripe_id').notNull(),
    avatar_url: text('avatar_url'),
    theme_preference: text('theme_preference').default('light'),
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

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertFacialProgressPhoto = typeof facialProgressPhotosTable.$inferInsert;
export type SelectFacialProgressPhoto = typeof facialProgressPhotosTable.$inferSelect;
