import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  front: text("front").notNull(),
  back: text("back").notNull(),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  cardId: varchar("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  answeredAt: timestamp("answered_at"),
});

export const studyProgress = pgTable("study_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  cardsStudied: integer("cards_studied").notNull().default(0),
  totalCards: integer("total_cards").notNull(),
  lastStudiedAt: timestamp("last_studied_at").defaultNow(),
  studyStreak: integer("study_streak").notNull().default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
  quizzes: many(quizzes),
  studyProgress: many(studyProgress),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  cards: many(cards),
  quizzes: many(quizzes),
  studyProgress: many(studyProgress),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  collection: one(collections, {
    fields: [cards.collectionId],
    references: [collections.id],
  }),
  quizQuestions: many(quizQuestions),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [quizzes.collectionId],
    references: [collections.id],
  }),
  questions: many(quizQuestions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  card: one(cards, {
    fields: [quizQuestions.cardId],
    references: [cards.id],
  }),
}));

export const studyProgressRelations = relations(studyProgress, ({ one }) => ({
  user: one(users, {
    fields: [studyProgress.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [studyProgress.collectionId],
    references: [collections.id],
  }),
}));

// Insert schemas
export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertStudyProgressSchema = createInsertSchema(studyProgress).omit({
  id: true,
});

// Types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type StudyProgress = typeof studyProgress.$inferSelect;
export type InsertStudyProgress = z.infer<typeof insertStudyProgressSchema>;
