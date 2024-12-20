import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  getMarineDataFromLocationAndDate,
  getForecastDataFromLocationAndDate,
} from "../../api/open-meteo/openMeteo";
import { format } from "date-fns";

const MARINE_BASE_URL = "https://marine-api.open-meteo.com/v1/marine";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const HISTORICAL_FORECAST_BASE_URL =
  "https://historical-forecast-api.open-meteo.com/v1/forecast";
const dateToday = format(new Date(Date.now()), "yyyy-MM-dd");

const server = setupServer(
  http.get(MARINE_BASE_URL, ({ request }) => {
    const url = new URL(request.url);
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");
    const date = url.searchParams.get("start_date");

    if (latitude === "34.05" && longitude === "-118.25" && date === dateToday) {
      return HttpResponse.json({
        timezone_abbreviation: "PST",
        hourly_units: {
          time: "ISO8601",
          swell_wave_height: "m",
          swell_wave_direction: "°",
          swell_wave_period: "s",
        },
        hourly: {
          time: [`${dateToday}T00:00`, `${dateToday}T01:00`],
          swell_wave_height: [1.2, 1.3],
          swell_wave_direction: [270, 280],
          swell_wave_period: [10, 11],
        },
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get(FORECAST_BASE_URL, ({ request }) => {
    const url = new URL(request.url);
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");
    const date = url.searchParams.get("start_date");

    if (latitude === "34.05" && longitude === "-118.25" && date === dateToday) {
      return HttpResponse.json({
        timezone_abbreviation: "PST",
        hourly_units: {
          time: "ISO8601",
          temperature_2m: "°C",
          weathercode: "code",
          wind_speed_10m: "m/s",
          wind_direction_10m: "°",
          soil_temperature_0cm: "°C",
        },
        hourly: {
          time: [`${dateToday}T00:00`, `${dateToday}T01:00`],
          temperature_2m: [15, 16],
          weathercode: [1, 2],
          wind_speed_10m: [3, 4],
          wind_direction_10m: [180, 190],
          soil_temperature_0cm: [12, 13],
          wind_gusts_10m: [5, 6],
        },
      });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.get(HISTORICAL_FORECAST_BASE_URL, ({ request }) => {
    const url = new URL(request.url);
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");
    const date = url.searchParams.get("start_date");

    if (
      latitude === "34.05" &&
      longitude === "-118.25" &&
      date === "2022-01-01"
    ) {
      return HttpResponse.json({
        timezone_abbreviation: "PST",
        hourly_units: {
          time: "ISO8601",
          temperature_2m: "°C",
          weathercode: "code",
          wind_speed_10m: "m/s",
          wind_direction_10m: "°",
          soil_temperature_0cm: "°C",
        },
        hourly: {
          time: ["2022-01-01T00:00", "2022-01-01T01:00"],
          temperature_2m: [14, 15],
          weathercode: [3, 4],
          wind_speed_10m: [2, 3],
          wind_direction_10m: [170, 180],
          soil_temperature_0cm: [10, 11],
          wind_gusts_10m: [4, 5],
        },
      });
    }
    return new HttpResponse(null, { status: 404 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Marine and Forecast Data API", () => {
  it("should fetch marine data successfully", async () => {
    const data = await getMarineDataFromLocationAndDate(
      "34.05",
      "-118.25",
      dateToday
    );

    expect(data).toMatchObject({
      timezone_abbreviation: "PST",
      hourly: {
        swell_wave_height: [1.2, 1.3],
        swell_wave_direction: [270, 280],
        swell_wave_period: [10, 11],
      },
    });
  });

  it("should fetch forecast data successfully", async () => {
    const data = await getForecastDataFromLocationAndDate(
      "34.05",
      "-118.25",
      dateToday
    );

    expect(data).toMatchObject({
      timezone_abbreviation: "PST",
      hourly: {
        temperature_2m: [15, 16],
        wind_speed_10m: [3, 4],
      },
    });
  });

  it("should fetch historical forecast data successfully", async () => {
    const data = await getForecastDataFromLocationAndDate(
      "34.05",
      "-118.25",
      "2022-01-01"
    );

    expect(data).toMatchObject({
      timezone_abbreviation: "PST",
      hourly: {
        temperature_2m: [14, 15],
        wind_speed_10m: [2, 3],
      },
    });
  });

  it("should return undefined for a failed marine data request", async () => {
    const data = await getMarineDataFromLocationAndDate("0", "0", "2024-01-01");
    expect(data).toBeUndefined();
  });

  it("should return undefined for a failed forecast data request", async () => {
    const data = await getForecastDataFromLocationAndDate(
      "0",
      "0",
      "2024-01-01"
    );
    expect(data).toBeUndefined();
  });
});
