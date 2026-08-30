import { STABLEFORD_CONFIG, type StablefordPlayer } from "./config";

export const normalizeCredential = (value: string): string =>
  value.trim().toLowerCase().replaceAll(/\s+/gu, "");

export const authenticateStablefordPlayer = (
  username: string,
  password: string,
): StablefordPlayer | undefined => {
  const normalizedUsername = normalizeCredential(username);
  const normalizedPassword = normalizeCredential(password);

  if (
    normalizedUsername.length === 0 ||
    normalizedUsername !== normalizedPassword
  ) {
    return;
  }

  return STABLEFORD_CONFIG.players.find(
    (player) => player.id === normalizedUsername,
  );
};

export const findStablefordPlayer = (
  playerId: string | undefined,
): StablefordPlayer | undefined => {
  if (playerId === undefined) {
    return;
  }

  return STABLEFORD_CONFIG.players.find((player) => player.id === playerId);
};
