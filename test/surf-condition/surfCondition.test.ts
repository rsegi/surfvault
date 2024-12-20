import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSurfConditions,
  updateSurfConditionsBySessionId,
} from "../../api/surf-condition/surfCondition";
import { surfConditions } from "db/schema";
import * as schema from "../../db/schema";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import {
  getMarineDataFromLocationAndDate,
  getForecastDataFromLocationAndDate,
  ForecastDataResponse,
  MarineDataResponse,
} from "api/open-meteo/openMeteo";

vi.mock("../../api/open-meteo/openMeteo", () => ({
  getMarineDataFromLocationAndDate: vi.fn(),
  getForecastDataFromLocationAndDate: vi.fn(),
}));

describe("surfCondition", () => {
  const mockTx = {
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn(),
      returning: vi.fn(),
    })),
    update: vi.fn().mockImplementation(() => ({
      where: vi.fn(),
      set: vi.fn(),
    })),
    set: vi.fn(),
    where: vi.fn(),
    returning: vi.fn(),
    values: vi.fn(),
  } as unknown as PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createSurfConditions", () => {
    it("should generate surf conditions for a full day with valid data", async () => {
      mockTx.insert = vi.fn();
      vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          swell_wave_height: Array(24).fill(1.2),
          swell_wave_direction: Array(24).fill(270),
          swell_wave_period: Array(24).fill(10),
        },
      } as MarineDataResponse);

      vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          temperature_2m: Array(24).fill(15),
          soil_temperature_0cm: Array(24).fill(12),
          weathercode: Array(24).fill(1),
          wind_direction_10m: Array(24).fill(180),
          wind_gusts_10m: Array(24).fill(5),
          wind_speed_10m: Array(24).fill(3),
        },
      } as ForecastDataResponse);

      const conditions = await createSurfConditions(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
      expect(mockTx.insert).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalledWith(surfConditions);
      expect(conditions).toBeUndefined();
    });

    it("should handle missing marine data gracefully", async () => {
      vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue(undefined);

      const conditions = await createSurfConditions(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
      expect(mockTx.insert).not.toHaveBeenCalled();
      expect(conditions).toBeUndefined();
    });

    it("should handle missing forecast data gracefully", async () => {
      vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue(
        undefined
      );

      const conditions = await createSurfConditions(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
      expect(mockTx.insert).not.toHaveBeenCalled();
      expect(conditions).toBeUndefined();
    });

    it("should handle incomplete data sets gracefully", async () => {
      vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: ["2023-01-01T00:00"],
          swell_wave_height: [1.2],
          swell_wave_direction: [270],
          swell_wave_period: [10],
        },
      } as MarineDataResponse);

      vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: ["2023-01-01T00:00"],
          temperature_2m: [15],
          soil_temperature_0cm: [12],
          weathercode: [1],
          wind_direction_10m: [180],
          wind_gusts_10m: [5],
          wind_speed_10m: [3],
        },
      } as ForecastDataResponse);

      const conditions = await createSurfConditions(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
      expect(mockTx.insert).not.toHaveBeenCalled();
      expect(conditions).toBeUndefined();
    });
  });

  it("should log an error if insertion fails", async () => {
    mockTx.insert = vi.fn().mockRejectedValue(new Error("Database error"));
    vi.spyOn(console, "error");

    vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue({
      hourly: {
        time: Array(24).fill("2023-01-01T00:00"),
        swell_wave_height: Array(24).fill(1.2),
        swell_wave_direction: Array(24).fill(270),
        swell_wave_period: Array(24).fill(10),
      },
    } as MarineDataResponse);

    vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue({
      hourly: {
        time: Array(24).fill("2023-01-01T00:00"),
        temperature_2m: Array(24).fill(15),
        soil_temperature_0cm: Array(24).fill(12),
        weathercode: Array(24).fill(1),
        wind_direction_10m: Array(24).fill(180),
        wind_gusts_10m: Array(24).fill(5),
        wind_speed_10m: Array(24).fill(3),
      },
    } as ForecastDataResponse);

    await createSurfConditions(
      mockTx,
      "session123",
      "34.05",
      "-118.25",
      "2023-01-01"
    );
    expect(mockTx.insert).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error creating session"),
      expect.any(Error)
    );
  });

  describe("updateSurfConditionsBySessionId", () => {
    it("should update surf conditions in the database", async () => {
      vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          swell_wave_height: Array(24).fill(1.2),
          swell_wave_direction: Array(24).fill(270),
          swell_wave_period: Array(24).fill(10),
        },
      } as MarineDataResponse);

      vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          temperature_2m: Array(24).fill(15),
          soil_temperature_0cm: Array(24).fill(12),
          weathercode: Array(24).fill(1),
          wind_direction_10m: Array(24).fill(180),
          wind_gusts_10m: Array(24).fill(5),
          wind_speed_10m: Array(24).fill(3),
        },
      } as ForecastDataResponse);

      await updateSurfConditionsBySessionId(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );
      expect(mockTx.update).toHaveBeenCalledTimes(24);
    });

    it("should log an error if update fails", async () => {
      mockTx.update = vi.fn().mockImplementation(() => ({
        set: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockRejectedValue(new Error("Database error")),
        })),
      }));

      vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(getMarineDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          swell_wave_height: Array(24).fill(1.2),
          swell_wave_direction: Array(24).fill(270),
          swell_wave_period: Array(24).fill(10),
        },
      } as MarineDataResponse);

      vi.mocked(getForecastDataFromLocationAndDate).mockResolvedValue({
        hourly: {
          time: Array(24).fill("2023-01-01T00:00"),
          temperature_2m: Array(24).fill(15),
          soil_temperature_0cm: Array(24).fill(12),
          weathercode: Array(24).fill(1),
          wind_direction_10m: Array(24).fill(180),
          wind_gusts_10m: Array(24).fill(5),
          wind_speed_10m: Array(24).fill(3),
        },
      } as ForecastDataResponse);

      await updateSurfConditionsBySessionId(
        mockTx,
        "session123",
        "34.05",
        "-118.25",
        "2023-01-01"
      );

      expect(mockTx.update).toHaveBeenCalled();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error updating surf conditions:"),
        expect.any(Error)
      );
    });
  });
});
