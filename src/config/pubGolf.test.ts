import { expect, test } from "bun:test";

import { deployedPlayerImages } from "./assets";
import { PUB_EVENT, PUB_PENALTIES } from "./pubGolf";

test("preserves the deployed teams, player identities, and credentials", () => {
  expect(PUB_EVENT.teams).toEqual({
    A: {
      key: "team1ONE",
      label: "Team 1",
      players: [
        { id: "a1", image: deployedPlayerImages.paul, name: "Paul" },
        { id: "a2", image: deployedPlayerImages.andy, name: "Andy" },
        { id: "a3", image: deployedPlayerImages.kyle, name: "Kyle" },
      ],
    },
    B: {
      key: "TEAM2two",
      label: "Team 2",
      players: [
        { id: "b1", image: deployedPlayerImages.ste, name: "Ste" },
        { id: "b2", image: deployedPlayerImages.sam, name: "Sam" },
        { id: "b3", image: deployedPlayerImages.ginny, name: "Ginny" },
      ],
    },
    C: {
      key: "TEAM3THREE",
      label: "Team 3",
      players: [
        { id: "c1", image: deployedPlayerImages.tim, name: "Tim" },
        { id: "c2", image: deployedPlayerImages.gav, name: "Gav" },
        { id: "c3", image: deployedPlayerImages.jack, name: "Jack" },
      ],
    },
  });
});

test("preserves all 18 deployed Pub Golf holes", () => {
  expect(PUB_EVENT.holes).toEqual([
    {
      id: "h1",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 1 (Ease In) | Hole 1",
    },
    {
      id: "h2",
      name: "Baby Guinness Shot",
      par: 2,
      pub: "Pub 1 (Ease In) | Hole 2",
    },
    {
      id: "h3",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 1 (Ease In) | Hole 3",
    },
    {
      id: "h4",
      name: "Vodka & Mixer (single)",
      par: 3,
      pub: "Pub 1 (Ease In) | Hole 4",
    },
    {
      id: "h5",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 1 (Ease In) | Hole 5",
    },
    {
      id: "h6",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 1 (Ease In) | Hole 6",
    },
    {
      id: "h7",
      name: "Pint Beer / Long Drink",
      par: 4,
      pub: "Pub 2 (Steady) | Hole 7",
    },
    {
      id: "h8",
      name: "Gin & Tonic (single)",
      par: 3,
      pub: "Pub 2 (Steady) | Hole 8",
    },
    {
      id: "h9",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 2 (Steady) | Hole 9",
    },
    {
      id: "h10",
      name: "Pint Beer / Long Drink",
      par: 4,
      pub: "Pub 2 (Steady) | Hole 10",
    },
    {
      id: "h11",
      name: "Vodka & Mixer (single)",
      par: 3,
      pub: "Pub 2 (Steady) | Hole 11",
    },
    {
      id: "h12",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 2 (Steady) | Hole 12",
    },
    {
      id: "h13",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 3 (Finish Strong) | Hole 13",
    },
    {
      id: "h14",
      name: "Baby Guinness Shot",
      par: 2,
      pub: "Pub 3 (Finish Strong) | Hole 14",
    },
    {
      id: "h15",
      name: "Half Pint Beer / Small Mixer",
      par: 3,
      pub: "Pub 3 (Finish Strong) | Hole 15",
    },
    {
      id: "h16",
      name: "Gin & Tonic (single)",
      par: 3,
      pub: "Pub 3 (Finish Strong) | Hole 16",
    },
    {
      id: "h17",
      name: "Choice Drink (light)",
      par: 3,
      pub: "Pub 3 (Finish Strong) | Hole 17",
    },
    {
      id: "h18",
      name: "Pint Beer / Long Drink",
      par: 4,
      pub: "Pub 3 (Finish Strong) | Hole 18",
    },
  ]);
});

test("preserves the deployed penalty definitions", () => {
  expect(PUB_PENALTIES).toEqual([
    { emoji: "💦", id: "spill", label: "Spill", points: 1 },
    { emoji: "🤢", id: "sick", label: "Sick", points: 5 },
    { emoji: "🚽", id: "toilet", label: "Toilet Break", points: 1 },
    { emoji: "🙅", id: "refuse", label: "Refusing a drink", points: 2 },
  ]);
});
