import { describe, it, expect, vi, afterEach } from "vitest";
import { insertSession, updateSessionById } from "api/session/session";
import {
  createSurfConditions,
  updateSurfConditionsBySessionId,
} from "../../api/surf-condition/surfCondition";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "../../db/schema";

vi.mock("../../api/surf-condition/surfCondition");
vi.mock("../../api/s3/s3Service");
vi.mock("../../db", () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      sessions: {
        findMany: vi.fn().mockImplementation(() => ({
          execute: vi.fn(),
        })),
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("Session", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("insertSession", () => {
    it("should insert a session and call createSurfConditions", async () => {
      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockResolvedValue([{ createdSession: "session123" }]),
          }),
        }),
      };

      vi.mocked(createSurfConditions).mockResolvedValue();

      const result = await insertSession(
        mockTx as unknown as PgTransaction<
          NodePgQueryResultHKT,
          typeof schema,
          ExtractTablesWithRelations<typeof schema>
        >,
        "user123",
        "34.05",
        "-118.25",
        "Test Session",
        "2023-01-01",
        "08:00"
      );

      expect(result).toEqual({ createdSession: "session123" });
      expect(mockTx.insert).toHaveBeenCalled();
      expect(createSurfConditions).toHaveBeenCalledWith(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
    });

    it("should log an error if insertion fails", async () => {
      const mockTx = {
        insert: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        insertSession(
          mockTx as unknown as PgTransaction<
            NodePgQueryResultHKT,
            typeof schema,
            ExtractTablesWithRelations<typeof schema>
          >,
          "user123",
          "34.05",
          "-118.25",
          "Test Session",
          "2023-01-01",
          "08:00"
        )
      ).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating session:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("updateSessionById", () => {
    it("should update a session and update surf conditions if location or date changes", async () => {
      const mockTx = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi
                .fn()
                .mockResolvedValue([{ updatedSession: "session123" }]),
            }),
          }),
        }),
      };

      vi.mocked(updateSurfConditionsBySessionId).mockResolvedValue();

      const result = await updateSessionById(
        "session123",
        mockTx as unknown as PgTransaction<
          NodePgQueryResultHKT,
          typeof schema,
          ExtractTablesWithRelations<typeof schema>
        >,
        "34.05",
        "34.05",
        "-118.25",
        "-118.25",
        "Updated Session",
        "2023-01-02",
        "2023-01-01",
        "10:00"
      );

      expect(result).toEqual({ updatedSession: "session123" });
      expect(mockTx.update).toHaveBeenCalled();
      expect(updateSurfConditionsBySessionId).toHaveBeenCalled();
    });

    it("should not update surf conditions if location and date are unchanged", async () => {
      const mockTx = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi
                .fn()
                .mockResolvedValue([{ updatedSession: "session123" }]),
            }),
          }),
        }),
      };

      vi.mocked(updateSurfConditionsBySessionId).mockResolvedValue();

      const result = await updateSessionById(
        "session123",
        mockTx as unknown as PgTransaction<
          NodePgQueryResultHKT,
          typeof schema,
          ExtractTablesWithRelations<typeof schema>
        >,
        "34.05",
        "34.05",
        "-118.25",
        "-118.25",
        "Updated Session",
        "2023-01-01",
        "2023-01-01",
        "10:00"
      );

      expect(result).toEqual({ updatedSession: "session123" });
      expect(mockTx.update).toHaveBeenCalled();
      expect(updateSurfConditionsBySessionId).not.toHaveBeenCalled();
    });
  });
});
