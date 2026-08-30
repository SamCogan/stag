export const formatPoints = (points: number): string =>
  `${String(points)} ${points === 1 ? "pt" : "pts"}`;

export const formatHoles = (holes: number): string =>
  `${String(holes)} ${holes === 1 ? "hole" : "holes"}`;

export const formatShots = (shots: number): string =>
  `${String(shots)} ${shots === 1 ? "shot" : "shots"}`;
