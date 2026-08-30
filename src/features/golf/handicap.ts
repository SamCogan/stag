export const getHandicapStrokes = (
  playingHandicap: number,
  strokeIndex: number,
): number => {
  if (playingHandicap <= 0) {
    return 0;
  }

  const baseStrokes = Math.floor(playingHandicap / 18);
  const extraStrokes = playingHandicap % 18;
  return baseStrokes + (strokeIndex <= extraStrokes ? 1 : 0);
};
