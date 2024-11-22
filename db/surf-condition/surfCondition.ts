import {
  getForecastDataFromLocationAndDate,
  getMarineDataFromLocationAndDate,
} from "api/open-meteo/openMeteo";
import { db } from "db";
import { surfConditions } from "db/schema";

export const createSurfConditions = async (
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

  if (generatedSurfConditions.length !== 23) {
    console.error("Surf conditions weren't generated for a full day.");
    return;
  }

  const surfConditionsWithSession = generatedSurfConditions.map(
    (generatedCondition) => ({
      sessionId,
      ...generatedCondition,
    })
  ) as SurfConditionWithSession[];

  try {
    await db.insert(surfConditions).values(surfConditionsWithSession);
  } catch (e) {
    console.error("Error creating session:", e);
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
        dateTime: marineData.hourly.time[entry],
        waveHeight: marineData.hourly.swell_wave_height[entry],
        waveDirection: marineData.hourly.swell_wave_direction[entry],
        wavePeriod: marineData.hourly.swell_wave_period[entry],
        temperature: forecastData.hourly.temperature_2m[entry],
        waterTemperature: forecastData.hourly.soil_temperature_0cm[entry],
        weatherCode: forecastData.hourly.weather_code[entry],
        windDirection: forecastData.hourly.wind_direction_10m[entry],
        windGusts: forecastData.hourly.wind_gusts_10m[entry],
        windSpeed: forecastData.hourly.wind_speed_10m[entry],
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
