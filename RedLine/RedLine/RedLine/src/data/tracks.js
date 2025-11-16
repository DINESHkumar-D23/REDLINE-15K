// src/data/tracks.js
import singapore from "../assets/singapore.svg";
import silverstone from "../assets/silverstone.svg";
import monza from "../assets/monza.svg";
import lasvegas from "../assets/lasvegas.svg";
import yasmarina from "../assets/yasmarina.svg";

export const tracks = [
  {
    id: "sgp",
    name: "Singapore",
    img: singapore,
    country: "Singapore",
    location: "Marina Bay, Singapore",
    laps: 61,
    length: "5.063 km",
    turns: 23,
    bestLapSeconds: 88.062,
    straights: "0.6 km",
    raceDistance: "308.7 km",
  },
  {
    id: "silverstone",
    name: "Silverstone",
    img: silverstone,
    country: "United Kingdom",
    location: "Silverstone, United Kingdom",
    laps: 52,
    length: "5.891 km",
    turns: 18,
    bestLapSeconds: 87.325,
    straights: "0.9 km",
    raceDistance: "306.2 km",
  },
  {
    id: "monza",
    name: "Monza",
    img: monza,
    country: "Italy",
    location: "Monza, Italy",
    laps: 53,
    length: "5.793 km",
    turns: 11,
    bestLapSeconds: 78.450,
    straights: "1.1 km",
    raceDistance: "306.7 km",
  },
  {
    id: "lasvegas",
    name: "Las Vegas",
    img: lasvegas,
    country: "USA",
    location: "Las Vegas, USA",
    laps: 50,
    length: "6.12 km",
    turns: 17,
    bestLapSeconds: 93.891,
    straights: "1.2 km",
    raceDistance: "306.0 km",
  },
  {
    id: "yas",
    name: "Yas Marina",
    img: yasmarina,
    country: "UAE",
    location: "Yas Island, Abu Dhabi",
    laps: 55,
    length: "5.281 km",
    turns: 21,
    bestLapSeconds: 89.234,
    straights: "1.2 km",
    raceDistance: "290.5 km",
  },
];
