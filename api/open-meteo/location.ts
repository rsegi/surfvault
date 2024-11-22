"use client";

export type GeocodingResponse = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  admin1: string;
  country_code: string;
};

export const getLocationByText = async (
  text: string
): Promise<GeocodingResponse[]> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5&language=es`
    );

    if (!response.ok) {
      console.error(
        `Ha habido un problema recuperando la ubicaciónÑ ${response.status}`
      );
      return [];
    }

    const object = await response.json();

    if (!object.results) {
      return [];
    }

    return object.results as GeocodingResponse[];
  } catch {
    console.error(`Ha habido un problema de conexión`);
    return [];
  }
};
