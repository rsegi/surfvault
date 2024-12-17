import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  decimal,
  date,
  time,
  real,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations } from "drizzle-orm";

const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique(),
  password: text("password"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessions = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: decimal("latitude", { precision: 7, scale: 5 }).notNull(),
  longitude: decimal("longitude", { precision: 8, scale: 5 }).notNull(),
  title: text("title").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  time: time().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  surfConditions: many(surfConditions),
}));

export const surfConditions = pgTable("surfCondition", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("sessionId")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  dateTime: time("time").notNull(),
  waveHeight: real("waveHeight").notNull(),
  waveDirection: integer("waveDirection").notNull(),
  wavePeriod: integer("wavePeriod").notNull(),
  windSpeed: real("windSpeed").notNull(),
  windDirection: integer("windDirection").notNull(),
  windGusts: real("windGusts").notNull(),
  temperature: integer("temperature").notNull(),
  waterTemperature: integer("waterTemperature").notNull(),
  weatherCode: integer("weatherCode").notNull(),
});

export const surfConditionsRelations = relations(surfConditions, ({ one }) => ({
  session: one(sessions, {
    fields: [surfConditions.sessionId],
    references: [sessions.id],
  }),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
