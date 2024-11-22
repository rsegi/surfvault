type WeatherDescription = {
  description: string;
  image: string;
};

export const WeatherCode: { [code: number]: WeatherDescription } = {
  0: {
    description: "Soleado",
    image: "/weather/clear-day.svg",
  },
  1: {
    description: "Mayormente Soleado",
    image: "/weather/mostly-clear-day.svg",
  },
  2: {
    description: "Parcialmente Nublado",
    image: "/weather/pasrtly-cloudy-day.svg",
  },
  3: {
    description: "Nublado",
    image: "/weather/cloudy.svg",
  },
  45: {
    description: "Niebla",
    image: "/weather/fog.svg",
  },
  48: {
    description: "Escarcha",
    image: "/weather/glazeice.svg",
  },
  51: {
    description: "LLovizna Ligera",
    image: "/weather/drizzle.svg",
  },
  53: {
    description: "Llovizna",
    image: "/weather/drizzle.svg",
  },
  54: {
    description: "Llovizna Intensa",
    image: "/weather/drizzle.svg",
  },
  56: {
    description: "Llovizna Gélida Ligera",
    image: "/weather/sleet.svg",
  },
  57: {
    description: "Llovizna Gélida",
    image: "/weather/sleet.svg",
  },
  61: {
    description: "Llúvia Ligera",
    image: "/weather/rain.svg",
  },
  63: {
    description: "Llúvia",
    image: "/weather/rain.svg",
  },
  65: {
    description: "Llúvia Intensa",
    image: "/weather/rain.svg",
  },
  66: {
    description: "Llúvia Helada Ligera",
    image: "/weather/freezingrain.svg",
  },
  67: {
    description: "Llúvia Helada",
    image: "/weather/freezingrain.svg",
  },
  71: {
    description: "Nieve Ligera",
    image: "/weather/snow.svg",
  },
  73: {
    description: "Nieve",
    image: "/weather/snow.svg",
  },
  75: {
    description: "Nieve Intensa",
    image: "/weather/snow.svg",
  },
  77: {
    description: "Cinarra",
    image: "/weather/hail.svg",
  },
  80: {
    description: "Chubascos Ligeros",
    image: "/weather/rain.svg",
  },
  81: {
    description: "Chubascos",
    image: "/weather/rain.svg",
  },
  82: {
    description: "Chubascos Intensos",
    image: "/weather/rain.svg",
  },
  85: {
    description: "Chubascos Ligeros de Nieve",
    image: "/weather/freezingrain.svg",
  },
  86: {
    description: "Chubascos de Nieve",
    image: "/weather/freezingrain.svg",
  },
  95: {
    description: "Tormenta",
    image: "/weather/thunderstorm.svg",
  },
  96: {
    description: "Tormentas Ligeras con Granizo",
    image: "/weather/thunderstorm-hail.svg",
  },
  99: {
    description: "Tormentas con Granizo",
    image: "/weather/thunderstorm-hail.svg",
  },
};
