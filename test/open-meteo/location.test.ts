import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { getLocationByText } from "../../api/open-meteo/location";

const server = setupServer(
  http.get("https://geocoding-api.open-meteo.com/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");

    if (name === "Barcelona") {
      return HttpResponse.json({
        results: [
          {
            name: "Barcelona",
            latitude: 41.3851,
            longitude: 2.1734,
            timezone: "Europe/Madrid",
            country: "Spain",
            admin1: "Catalonia",
            country_code: "ES",
          },
        ],
      });
    } else {
      return HttpResponse.json({ results: [] });
    }
  })
);

describe("getLocationByText", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it("should return geocoding results for a valid location", async () => {
    const results = await getLocationByText("Barcelona");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: "Barcelona",
      latitude: 41.3851,
      longitude: 2.1734,
      timezone: "Europe/Madrid",
      country: "Spain",
      admin1: "Catalonia",
      country_code: "ES",
    });
  });

  it("should return an empty array if no results are found", async () => {
    const results = await getLocationByText("Nonexistent");

    expect(results).toHaveLength(0);
  });

  it("should handle API errors gracefully", async () => {
    server.use(
      http.get("https://geocoding-api.open-meteo.com/v1/search", () =>
        HttpResponse.error()
      )
    );

    const results = await getLocationByText("ErrorTest");

    expect(results).toHaveLength(0);
  });
});
