import { useState, useEffect } from "react";

export function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function rgbToYIQ({ r, g, b }) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function hexToRgb(hex) {
  if (!hex || hex === undefined || hex === "") {
    return undefined;
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : undefined;
}
export function contrast(colorHex, threshold = 128) {
  if (colorHex === undefined) {
    return "#000";
  }

  const rgb = hexToRgb(colorHex);

  if (rgb === undefined) {
    return "#000";
  }

  return rgbToYIQ(rgb) >= threshold ? "#000" : "#fff";
}

export const severity = [
  "Not decided yet!",
  "I don't agree that this is a usability problem at all",
  "Cosmetic problem only: need not be fixed unless extra time is available on project",
  "Minor usability problem: fixing this should be given low priority",
  "Major usability problem: important to fix, so should be given high priority",
  "Usability catastrophe: imperative to fix this before product can be released",
];

export const marks = {
  0: "TBD",
  20: "0",
  40: "1",
  60: "2",
  80: "3",
  100: "4",
};

const marksLen = Object.keys(marks).length - 1;

export const markToSeverity = (el) => el / (100 / marksLen);
export const severityToMark = (el) => el * (100 / marksLen);

export const nielsonHeuristics = [
  "Visibility of system status",
  "Match between system and the real world",
  "User control and freedom",
  "Consistency and standards",
  "Error prevention",
  "Recognition rather than recall",
  "Flexibility and efficiency of use",
  "Aesthetic and minimalist design",
  "Help users recognize, diagnose, and recover from errors",
  "Help and documentation",
];

// Hook
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
