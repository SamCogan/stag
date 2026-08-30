import * as v from "valibot";

import { deployedPlayerImages } from "./assets";
import { pubEventSchema } from "./eventSchemas";

export const PUB_EVENT = v.parse(pubEventSchema, {
  title: "Ste's Stag 2026",
  holes: [
    {
      id: "h1",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 1",
      par: 3,
    },
    {
      id: "h2",
      name: "Baby Guinness Shot",
      pub: "Pub 1 (Ease In) | Hole 2",
      par: 2,
    },
    {
      id: "h3",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 3",
      par: 3,
    },
    {
      id: "h4",
      name: "Vodka & Mixer (single)",
      pub: "Pub 1 (Ease In) | Hole 4",
      par: 3,
    },
    {
      id: "h5",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 5",
      par: 3,
    },
    {
      id: "h6",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 6",
      par: 3,
    },
    {
      id: "h7",
      name: "Pint Beer / Long Drink",
      pub: "Pub 2 (Steady) | Hole 7",
      par: 4,
    },
    {
      id: "h8",
      name: "Gin & Tonic (single)",
      pub: "Pub 2 (Steady) | Hole 8",
      par: 3,
    },
    {
      id: "h9",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 2 (Steady) | Hole 9",
      par: 3,
    },
    {
      id: "h10",
      name: "Pint Beer / Long Drink",
      pub: "Pub 2 (Steady) | Hole 10",
      par: 4,
    },
    {
      id: "h11",
      name: "Vodka & Mixer (single)",
      pub: "Pub 2 (Steady) | Hole 11",
      par: 3,
    },
    {
      id: "h12",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 2 (Steady) | Hole 12",
      par: 3,
    },
    {
      id: "h13",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 3 (Finish Strong) | Hole 13",
      par: 3,
    },
    {
      id: "h14",
      name: "Baby Guinness Shot",
      pub: "Pub 3 (Finish Strong) | Hole 14",
      par: 2,
    },
    {
      id: "h15",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 3 (Finish Strong) | Hole 15",
      par: 3,
    },
    {
      id: "h16",
      name: "Gin & Tonic (single)",
      pub: "Pub 3 (Finish Strong) | Hole 16",
      par: 3,
    },
    {
      id: "h17",
      name: "Choice Drink (light)",
      pub: "Pub 3 (Finish Strong) | Hole 17",
      par: 3,
    },
    {
      id: "h18",
      name: "Pint Beer / Long Drink",
      pub: "Pub 3 (Finish Strong) | Hole 18",
      par: 4,
    },
  ],
  teams: {
    A: {
      label: "Team 1",
      key: "team1ONE",
      players: [
        { id: "a1", name: "Paul", image: deployedPlayerImages.paul },
        { id: "a2", name: "Andy", image: deployedPlayerImages.andy },
        { id: "a3", name: "Kyle", image: deployedPlayerImages.kyle },
      ],
    },
    B: {
      label: "Team 2",
      key: "TEAM2two",
      players: [
        { id: "b1", name: "Ste", image: deployedPlayerImages.ste },
        { id: "b2", name: "Sam", image: deployedPlayerImages.sam },
        { id: "b3", name: "Ginny", image: deployedPlayerImages.ginny },
      ],
    },
    C: {
      label: "Team 3",
      key: "TEAM3THREE",
      players: [
        { id: "c1", name: "Tim", image: deployedPlayerImages.tim },
        { id: "c2", name: "Gav", image: deployedPlayerImages.gav },
        { id: "c3", name: "Jack", image: deployedPlayerImages.jack },
      ],
    },
  },
});

export const PUB_PENALTIES = [
  { id: "spill", label: "Spill", emoji: "💦", points: 1 },
  { id: "sick", label: "Sick", emoji: "🤢", points: 5 },
  { id: "toilet", label: "Toilet Break", emoji: "🚽", points: 1 },
  { id: "refuse", label: "Refusing a drink", emoji: "🙅", points: 2 },
] as const;
