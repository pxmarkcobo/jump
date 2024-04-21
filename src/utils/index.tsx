/**
 * Converts a number of seconds into a mm:ss format.
 *
 * @param {number} totalSeconds The total number of seconds to convert.
 * @return {string} Returns the time in mm:ss format.
 */
export function secondsToMMSS(totalSeconds, paddedMinutes = false) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Pad the minutes and seconds with leading zeros if they are less than 10
  let formattedMinutes = minutes.toString();
  if (paddedMinutes) {
    formattedMinutes = formattedMinutes.padStart(2, "0");
  }
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
