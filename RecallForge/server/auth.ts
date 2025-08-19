import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, loginUserSchema, insertUserSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string | null;
      password: string;
      firstName: string | null;
      lastName: string | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "잘못된 아이디 또는 비밀번호입니다." });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Deserialize user error:", error);
      done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
      }

      if (validatedData.email) {
        const existingEmail = await storage.getUserByEmail(validatedData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
        }
      }

      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName 
        });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "입력 데이터가 올바르지 않습니다." });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: User | false, info: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "잘못된 아이디 또는 비밀번호입니다." });
        }
        req.login(user, (err) => {
          if (err) {
            console.error("Session error:", err);
            return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
          }
          res.status(200).json({ 
            id: user.id, 
            username: user.username, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName 
          });
        });
      })(req, res, next);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "입력 데이터가 올바르지 않습니다." });
      }
      res.status(400).json({ message: "잘못된 요청입니다." });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.sendStatus(401);
    }
    const user = req.user as User;
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName 
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.sendStatus(401);
    }
    const user = req.user as User;
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName 
    });
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "로그인이 필요합니다." });
}