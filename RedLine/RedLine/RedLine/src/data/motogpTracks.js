// src/data/motogpTracks.js
import losail from "../assets/losail.svg";
import jerez from "../assets/jerez.svg";
import mugello from "../assets/mugello.svg";
import assen from "../assets/assen.svg";
import silverstone from "../assets/silverstone.svg";
import phillipisland from "../assets/phillipisland.svg";
import motegi from "../assets/motegi.svg";
import algarve from "../assets/algarve.svg";

export const motogpTracks = [
  {
    id: "losail",
    name: "Losail",
    img: losail,
    country: "Qatar",
    location: "Doha, Qatar",
    laps: 22,
    length: "5.380 km",
    turns: 16,
    bestLapSeconds: 94.082,
    straights: "1.1 km",
    // 5.380 km * 22 laps = 118.36 km
    raceDistance: "118.36 km",
  },
  {
    id: "jerez",
    name: "Jerez",
    img: jerez,
    country: "Spain",
    location: "Jerez de la Frontera, Spain",
    laps: 25,
    length: "4.423 km",
    turns: 13,
    bestLapSeconds: 87.325,
    straights: "0.9 km",
    // 4.423 km * 25 laps = 110.575 km
    raceDistance: "110.575 km",
  },
  {
    id: "mugello",
    name: "Mugello",
    img: mugello,
    country: "Italy",
    location: "Mugello, Italy",
    laps: 20,
    length: "5.245 km",
    turns: 15,
    bestLapSeconds: 91.456,
    straights: "1.1 km",
    // 5.245 km * 20 laps = 104.9 km
    raceDistance: "104.90 km",
  },
  {
    id: "assen",
    name: "Assen",
    img: assen,
    country: "Netherlands",
    location: "Assen, Netherlands",
    laps: 26,
    length: "4.542 km",
    turns: 18,
    bestLapSeconds: 89.234,
    straights: "0.7 km",
    // 4.542 km * 26 laps = 118.092 km
    raceDistance: "118.092 km",
  },
  {
    id: "silverstone_mgp",
    name: "Silverstone",
    img: silverstone,
    country: "United Kingdom",
    location: "Silverstone, United Kingdom",
    laps: 20,
    length: "5.900 km",
    turns: 18,
    bestLapSeconds: 96.567,
    straights: "1.0 km",
    // 5.900 km * 20 laps = 118.00 km
    raceDistance: "118.00 km",
  },
  {
    id: "phillipisland",
    name: "Phillip Island",
    img: phillipisland,
    country: "Australia",
    location: "Phillip Island, Australia",
    laps: 27,
    length: "4.445 km",
    turns: 12,
    bestLapSeconds: 88.891,
    straights: "0.8 km",
    // 4.445 km * 27 laps = 120.015 km
    raceDistance: "120.015 km",
  },
  {
    id: "motegi",
    name: "Motegi",
    img: motegi,
    country: "Japan",
    location: "Motegi, Japan",
    laps: 24,
    length: "4.801 km",
    turns: 14,
    bestLapSeconds: 92.123,
    straights: "0.6 km",
    // 4.801 km * 24 laps = 115.224 km
    raceDistance: "115.224 km",
  },
  {
    id: "algarve",
    name: "Algarve",
    img: algarve,
    country: "Portugal",
    location: "Portimão, Portugal",
    laps: 25,
    length: "4.592 km",
    turns: 15,
    bestLapSeconds: 90.345,
    straights: "0.9 km",
    // 4.592 km * 25 laps = 114.80 km
    raceDistance: "114.80 km",
  },
];
