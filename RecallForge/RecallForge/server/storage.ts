import {
  users,
  collections,
  cards,
  quizzes,
  quizQuestions,
  studyProgress,
  type User,
  type InsertUser,
  type Collection,
  type InsertCollection,
  type Card,
  type InsertCard,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type StudyProgress,
  type InsertStudyProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Collection operations
  getCollections(userId: string): Promise<Collection[]>;
  getCollection(id: string, userId: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>, userId: string): Promise<Collection | undefined>;
  deleteCollection(id: string, userId: string): Promise<boolean>;
  
  // Card operations
  getCards(collectionId: string, userId: string): Promise<Card[]>;
  getCard(id: string, userId: string): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, card: Partial<InsertCard>, userId: string): Promise<Card | undefined>;
  deleteCard(id: string, userId: string): Promise<boolean>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: string, userId: string): Promise<Quiz | undefined>;
  getQuizzes(userId: string): Promise<Quiz[]>;
  getQuizWithQuestions(id: string, userId: string): Promise<(Quiz & { questions: (QuizQuestion & { card: Card })[] }) | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestion(id: string, question: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined>;
  completeQuiz(id: string, correctAnswers: number): Promise<Quiz | undefined>;
  
  // Study progress operations
  getStudyProgress(userId: string): Promise<StudyProgress[]>;
  updateStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    totalCards: number;
    totalCollections: number;
    completedQuizzes: number;
    studyStreak: number;
    recentCollections: Collection[];
  }>;
  
  // Search operations
  searchCollections(userId: string, query: string): Promise<Collection[]>;
  searchCards(userId: string, query: string): Promise<(Card & { collection: Collection })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Collection operations
  async getCollections(userId: string): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.updatedAt));
  }

  async getCollection(id: string, userId: string): Promise<Collection | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, userId)));
    return collection;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [created] = await db
      .insert(collections)
      .values(collection)
      .returning();
    return created;
  }

  async updateCollection(id: string, collection: Partial<InsertCollection>, userId: string): Promise<Collection | undefined> {
    const [updated] = await db
      .update(collections)
      .set({ ...collection, updatedAt: new Date() })
      .where(and(eq(collections.id, id), eq(collections.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Card operations
  async getCards(collectionId: string, userId: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .innerJoin(collections, eq(cards.collectionId, collections.id))
      .where(and(eq(cards.collectionId, collectionId), eq(collections.userId, userId)))
      .then(rows => rows.map(row => row.cards));
  }

  async getCard(id: string, userId: string): Promise<Card | undefined> {
    const [result] = await db
      .select()
      .from(cards)
      .innerJoin(collections, eq(cards.collectionId, collections.id))
      .where(and(eq(cards.id, id), eq(collections.userId, userId)));
    return result?.cards;
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [created] = await db
      .insert(cards)
      .values(card)
      .returning();
    return created;
  }

  async updateCard(id: string, card: Partial<InsertCard>, userId: string): Promise<Card | undefined> {
    const [updated] = await db
      .update(cards)
      .set({ ...card, updatedAt: new Date() })
      .where(
        and(
          eq(cards.id, id),
          eq(cards.collectionId, 
            sql`(SELECT id FROM ${collections} WHERE id = ${cards.collectionId} AND user_id = ${userId})`
          )
        )
      )
      .returning();
    return updated;
  }

  async deleteCard(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(cards)
      .where(
        and(
          eq(cards.id, id),
          eq(cards.collectionId, 
            sql`(SELECT id FROM ${collections} WHERE id = ${cards.collectionId} AND user_id = ${userId})`
          )
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [created] = await db
      .insert(quizzes)
      .values(quiz)
      .returning();
    return created;
  }

  async getQuiz(id: string, userId: string): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.userId, userId)));
    return quiz;
  }

  async getQuizzes(userId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async getQuizWithQuestions(id: string, userId: string): Promise<(Quiz & { questions: (QuizQuestion & { card: Card })[] }) | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.userId, userId)));
    
    if (!quiz) return undefined;

    const questions = await db
      .select()
      .from(quizQuestions)
      .innerJoin(cards, eq(quizQuestions.cardId, cards.id))
      .where(eq(quizQuestions.quizId, id));

    return {
      ...quiz,
      questions: questions.map(row => ({
        ...row.quiz_questions,
        card: row.cards
      }))
    };
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [created] = await db
      .insert(quizQuestions)
      .values(question)
      .returning();
    return created;
  }

  async updateQuizQuestion(id: string, question: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined> {
    const [updated] = await db
      .update(quizQuestions)
      .set(question)
      .where(eq(quizQuestions.id, id))
      .returning();
    return updated;
  }

  async completeQuiz(id: string, correctAnswers: number): Promise<Quiz | undefined> {
    const [updated] = await db
      .update(quizzes)
      .set({ 
        correctAnswers, 
        completedAt: new Date() 
      })
      .where(eq(quizzes.id, id))
      .returning();
    return updated;
  }

  // Study progress operations
  async getStudyProgress(userId: string): Promise<StudyProgress[]> {
    return await db
      .select()
      .from(studyProgress)
      .where(eq(studyProgress.userId, userId));
  }

  async updateStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress> {
    const [updated] = await db
      .insert(studyProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [studyProgress.userId, studyProgress.collectionId],
        set: {
          cardsStudied: progress.cardsStudied,
          totalCards: progress.totalCards,
          lastStudiedAt: new Date(),
          studyStreak: progress.studyStreak,
        },
      })
      .returning();
    return updated;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    totalCards: number;
    totalCollections: number;
    completedQuizzes: number;
    studyStreak: number;
    recentCollections: Collection[];
  }> {
    const [cardCount] = await db
      .select({ count: count() })
      .from(cards)
      .innerJoin(collections, eq(cards.collectionId, collections.id))
      .where(eq(collections.userId, userId));

    const [collectionCount] = await db
      .select({ count: count() })
      .from(collections)
      .where(eq(collections.userId, userId));

    const [quizCount] = await db
      .select({ count: count() })
      .from(quizzes)
      .where(and(eq(quizzes.userId, userId), sql`completed_at IS NOT NULL`));

    const recentCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.updatedAt))
      .limit(3);

    const progressRecords = await db
      .select()
      .from(studyProgress)
      .where(eq(studyProgress.userId, userId));

    const maxStreak = progressRecords.reduce((max, record) => 
      Math.max(max, record.studyStreak), 0);

    return {
      totalCards: cardCount?.count || 0,
      totalCollections: collectionCount?.count || 0,
      completedQuizzes: quizCount?.count || 0,
      studyStreak: maxStreak,
      recentCollections,
    };
  }

  // Search operations
  async searchCollections(userId: string, query: string): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.userId, userId),
          sql`${collections.title} ILIKE ${`%${query}%`} OR ${collections.description} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(collections.updatedAt));
  }

  async searchCards(userId: string, query: string): Promise<(Card & { collection: Collection })[]> {
    const results = await db
      .select()
      .from(cards)
      .innerJoin(collections, eq(cards.collectionId, collections.id))
      .where(
        and(
          eq(collections.userId, userId),
          sql`${cards.front} ILIKE ${`%${query}%`} OR ${cards.back} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(cards.updatedAt));

    return results.map(row => ({
      ...row.cards,
      collection: row.collections
    }));
  }
}

export const storage = new DatabaseStorage();
