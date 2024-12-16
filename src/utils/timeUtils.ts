export const roundTimeToHour = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  if (minute > 30) {
    return `${(hour + 1).toString().padStart(2, "0")}:00:00`;
  }

  return `${hour.toString().padStart(2, "0")}:00:00`;
};

export const removeSeconds = (time: string) => {
  return time.slice(0, -3);
};
