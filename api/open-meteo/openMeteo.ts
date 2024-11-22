const BASE_URL = "https://api.open-meteo.com/v1/";

export const getMarineDataFromLocationAndDate = async (
  latitude: string,
  longitude: string,
  date: string
): Promise<MarineDataResponse | undefined> => {
  const url = `${BASE_URL}marine?latitude=${latitude}&longitude=${longitude}&hourly=swell_wave_height,swell_wave_direction,swell_wave_period&start_date=${date}&end_date=${date}&timezone=auto`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Ha ocurrido un error recuperando datos maritimos: ${response.status}`
      );
      return;
    }

    return (await response.json()) as MarineDataResponse;
  } catch {
    console.error("Ha habido un problema de conexión");
  }
};

export const getForecastDataFromLocationAndDate = async (
  latitude: string,
  longitude: string,
  date: string
): Promise<ForecastDataResponse | undefined> => {
  const url = `${BASE_URL}forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m,weathercode,soil_temperature_0cm&cell_selection=sea&start_date=${date}&end_date=${date}&timezone=auto`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Ha ocurrido un error recuperando datos meteorológicos: ${response.status}`
      );
      return;
    }

    return (await response.json()) as ForecastDataResponse;
  } catch {
    console.error("Ha habido un problema de conexión");
  }
};

type MarineDataResponse = {
  timezone_abbreviation: string;
  hourly_units: {
    time: string;
    swell_wave_height: string;
    swell_wave_direction: string;
    swell_wave_period: string;
  };
  hourly: {
    time: string[];
    swell_wave_height: number[];
    swell_wave_direction: number[];
    swell_wave_period: number[];
  };
};

type ForecastDataResponse = {
  timezone_abbreviation: string;
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    soil_temperature_0cm: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    soil_temperature_0cm: number[];
    wind_gusts_10m: number[];
  };
};
