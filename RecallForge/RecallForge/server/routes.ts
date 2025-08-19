import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertCollectionSchema, insertCardSchema, insertQuizSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Collection routes
  app.get('/api/collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const collections = await storage.getCollections(userId);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get('/api/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const collection = await storage.getCollection(req.params.id, userId);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  app.post('/api/collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCollectionSchema.parse({
        ...req.body,
        userId,
      });
      const collection = await storage.createCollection(validatedData);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Error creating collection:", error);
      res.status(400).json({ message: "Failed to create collection" });
    }
  });

  app.put('/api/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCollectionSchema.partial().parse(req.body);
      const collection = await storage.updateCollection(req.params.id, validatedData, userId);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(400).json({ message: "Failed to update collection" });
    }
  });

  app.delete('/api/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deleted = await storage.deleteCollection(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Card routes
  app.get('/api/collections/:collectionId/cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cards = await storage.getCards(req.params.collectionId, userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post('/api/collections/:collectionId/cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const collectionId = req.params.collectionId;
      
      // Verify collection belongs to user
      const collection = await storage.getCollection(collectionId, userId);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      const validatedData = insertCardSchema.parse({
        ...req.body,
        collectionId,
      });
      const card = await storage.createCard(validatedData);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(400).json({ message: "Failed to create card" });
    }
  });

  app.put('/api/cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCardSchema.partial().parse(req.body);
      const card = await storage.updateCard(req.params.id, validatedData, userId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(400).json({ message: "Failed to update card" });
    }
  });

  app.delete('/api/cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deleted = await storage.deleteCard(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ message: "Failed to delete card" });
    }
  });

  // Quiz routes
  app.post('/api/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { collectionId, questionCount, quizType } = req.body;

      // Verify collection belongs to user
      const collection = await storage.getCollection(collectionId, userId);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      // Get cards for the quiz
      const cards = await storage.getCards(collectionId, userId);
      if (cards.length === 0) {
        return res.status(400).json({ message: "No cards found in collection" });
      }

      // Shuffle and limit cards
      const shuffledCards = cards.sort(() => Math.random() - 0.5);
      const selectedCards = shuffledCards.slice(0, Math.min(questionCount, cards.length));

      // Create quiz
      const quizData = {
        title: `${collection.title} Quiz`,
        collectionId,
        userId,
        totalQuestions: selectedCards.length,
      };

      const quiz = await storage.createQuiz(quizData);

      // Create quiz questions
      for (const card of selectedCards) {
        await storage.createQuizQuestion({
          quizId: quiz.id,
          cardId: card.id,
        });
      }

      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.get('/api/quizzes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quiz = await storage.getQuizWithQuestions(req.params.id, userId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quizzes/:id/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { questionId, userAnswer } = req.body;

      // Verify quiz belongs to user
      const quiz = await storage.getQuiz(req.params.id, userId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Get the question and card to check answer
      const quizWithQuestions = await storage.getQuizWithQuestions(req.params.id, userId);
      const question = quizWithQuestions?.questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = question.card.back.toLowerCase().trim() === userAnswer.toLowerCase().trim();

      // Update question with answer
      const updatedQuestion = await storage.updateQuizQuestion(questionId, {
        userAnswer,
        isCorrect,
        answeredAt: new Date(),
      });

      res.json({ isCorrect, correctAnswer: question.card.back });
    } catch (error) {
      console.error("Error submitting quiz answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.post('/api/quizzes/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get quiz with questions to calculate score
      const quizWithQuestions = await storage.getQuizWithQuestions(req.params.id, userId);
      if (!quizWithQuestions) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const correctAnswers = quizWithQuestions.questions.filter(q => q.isCorrect).length;
      const completedQuiz = await storage.completeQuiz(req.params.id, correctAnswers);

      res.json(completedQuiz);
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  app.get('/api/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quizzes = await storage.getQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Search routes
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const [collections, cards] = await Promise.all([
        storage.searchCollections(userId, query),
        storage.searchCards(userId, query),
      ]);

      res.json({ collections, cards });
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
