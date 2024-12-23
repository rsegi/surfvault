import {
  getForecastDataFromLocationAndDate,
  getMarineDataFromLocationAndDate,
} from "api/open-meteo/openMeteo";
import { surfConditions } from "db/schema";
import { and, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import * as schema from "../../db/schema";

export const createSurfConditions = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  sessionId: string,
  latitude: string,
  longitude: string,
  date: string
) => {
  const generatedSurfConditions = await generateSurfConditions(
    latitude,
    longitude,
    date
  );

  if (generatedSurfConditions.length !== 24) {
    console.error("Surf conditions weren't generated for a full day.");
    return;
  }

  const surfConditionsWithSession = generatedSurfConditions.map(
    (generatedCondition) =>
      ({
        sessionId,
        dateTime: generatedCondition.dateTime,
        waveHeight: generatedCondition.waveHeight ?? 0,
        waveDirection: generatedCondition.waveDirection ?? 0,
        wavePeriod: generatedCondition.wavePeriod ?? 0,
        windSpeed: generatedCondition.windSpeed ?? 0,
        windDirection: generatedCondition.windDirection ?? 0,
        windGusts: generatedCondition.windGusts ?? 0,
        temperature: generatedCondition.temperature ?? 0,
        waterTemperature: generatedCondition.waterTemperature ?? 0,
        weatherCode: generatedCondition.weatherCode ?? 0,
      }) as SurfConditionWithSession
  ) as SurfConditionWithSession[];

  try {
    await tx.insert(surfConditions).values(surfConditionsWithSession);
  } catch (e) {
    console.error("Error creating session:", e);
  }
};

export const updateSurfConditionsBySessionId = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  sessionId: string,
  latitude: string,
  longitude: string,
  date: string
) => {
  try {
    const generatedSurfConditions = await generateSurfConditions(
      latitude,
      longitude,
      date
    );

    if (generatedSurfConditions.length !== 24) {
      console.error("Surf conditions weren't generated for a full day.");
      return;
    }
    generatedSurfConditions.forEach(async (sc) => {
      try {
        await tx
          .update(surfConditions)
          .set({ ...sc })
          .where(
            and(
              eq(surfConditions.sessionId, sessionId),
              eq(surfConditions.dateTime, sc.dateTime)
            )
          );
      } catch (e) {
        console.error("Error updating surf conditions:", e);
      }
    });
  } catch (e) {
    console.error("Error creating session:", e);
    throw e;
  }
};

const generateSurfConditions = async (
  latitude: string,
  longitude: string,
  date: string
): Promise<GeneratedSurfCondition[]> => {
  const marineData = await getMarineDataFromLocationAndDate(
    latitude,
    longitude,
    date
  );
  const forecastData = await getForecastDataFromLocationAndDate(
    latitude,
    longitude,
    date
  );

  const sessionData: GeneratedSurfCondition[] = [];

  if (marineData && forecastData) {
    for (let entry = 0; entry < marineData.hourly.time.length; entry++) {
      const hourlySessionData: GeneratedSurfCondition = {
        dateTime: marineData.hourly.time[entry].split("T")[1],
        waveHeight: marineData.hourly.swell_wave_height[entry] ?? 0,
        waveDirection: marineData.hourly.swell_wave_direction[entry] ?? 0,
        wavePeriod: Math.round(marineData.hourly.swell_wave_period[entry]) ?? 0,
        temperature: Math.round(forecastData.hourly.temperature_2m[entry]) ?? 0,
        waterTemperature:
          Math.round(forecastData.hourly.soil_temperature_0cm[entry]) ?? 0,
        weatherCode: forecastData.hourly.weathercode[entry] ?? 0,
        windDirection: forecastData.hourly.wind_direction_10m[entry] ?? 0,
        windGusts: forecastData.hourly.wind_gusts_10m[entry] ?? 0,
        windSpeed: forecastData.hourly.wind_speed_10m[entry] ?? 0,
      };
      sessionData.push(hourlySessionData);
    }
  }

  return sessionData;
};

export type GeneratedSurfCondition = {
  dateTime: string;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  temperature: number;
  waterTemperature: number;
  weatherCode: number;
};

export type SurfConditionWithSession = {
  sessionId: string;
} & GeneratedSurfCondition;
