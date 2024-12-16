export const getDirectionFromDegrees = (degrees: number) => {
  const directions = [
    "N", // 0° to 11.25° and 348.75° to 360°
    "NNE", // 11.25° to 33.75°
    "NE", // 33.75° to 56.25°
    "ENE", // 56.25° to 78.75°
    "E", // 78.75° to 101.25°
    "ESE", // 101.25° to 123.75°
    "SE", // 123.75° to 146.25°
    "SSE", // 146.25° to 168.75°
    "S", // 168.75° to 191.25°
    "SSO", // 191.25° to 213.75°
    "SO", // 213.75° to 236.25°
    "OSO", // 236.25° to 258.75°
    "O", // 258.75° to 281.25°
    "ONO", // 281.25° to 303.75°
    "NO", // 303.75° to 326.25°
    "NNO", // 326.25° to 348.75°
  ];

  // 360/16 for the 16 different directions = 22.5
  const index = Math.round(degrees / 22.5) % 16;

  return directions[index];
};
