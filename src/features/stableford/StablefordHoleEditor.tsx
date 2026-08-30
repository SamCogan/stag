import { EraserIcon } from "@phosphor-icons/react/Eraser";
import { FlagIcon } from "@phosphor-icons/react/Flag";
import { MinusCircleIcon } from "@phosphor-icons/react/MinusCircle";
import { PlusCircleIcon } from "@phosphor-icons/react/PlusCircle";
import { type PointerEventHandler, useState } from "react";

import { formatPoints, formatShots } from "./formatting";

import type { StablefordHole } from "./config";
import type { StablefordHoleResult } from "./scoring";

interface StablefordHoleEditorProperties {
  disabled: boolean;
  hole: StablefordHole;
  onClear: () => Promise<void>;
  onFeedback: (message: string) => void;
  onPickup: () => Promise<void>;
  onScore: (gross: number) => Promise<void>;
  result: StablefordHoleResult;
  shotsSubject?: string;
}

const getActionError = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to update this hole";

const runAction = async (
  action: Promise<void>,
  message: string,
  onFeedback: (message: string) => void,
): Promise<void> => {
  try {
    await action;
    onFeedback(message);
  } catch (error: unknown) {
    onFeedback(getActionError(error));
  }
};

const getResultLabel = (result: StablefordHoleResult): string => {
  if (result.status === "scored") {
    return `Net ${String(result.net)}`;
  }
  return result.status === "picked-up" ? "Picked up" : "Unplayed";
};

const preventInputBlur: PointerEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
};

const parseGross = (value: string): number | undefined => {
  const gross = Number(value);
  return Number.isInteger(gross) && gross > 0 ? gross : undefined;
};

const getIncreasedGross = (
  inputValue: string,
  gross: number | undefined,
  par: number,
): number => {
  const currentGross = parseGross(inputValue) ?? gross;
  return currentGross === undefined ? par : currentGross + 1;
};

type EditorProperties = StablefordHoleEditorProperties;

const StablefordScoreInput = ({
  disabled,
  hole,
  onClear,
  onFeedback,
  onScore,
  result,
}: Omit<EditorProperties, "onPickup">) => {
  const gross = result.status === "scored" ? result.gross : undefined;
  const [inputValue, setInputValue] = useState(
    gross === undefined ? "" : String(gross),
  );
  const stepGross = parseGross(inputValue) ?? gross ?? hole.par;
  const commitInput = (): void => {
    if (inputValue.trim() === "") {
      if (gross !== undefined) {
        void runAction(
          onClear(),
          `Hole ${String(hole.number)} score cleared`,
          onFeedback,
        );
      }
      return;
    }

    const next = Number(inputValue);
    if (!Number.isInteger(next) || next < 1) {
      setInputValue(gross === undefined ? "" : String(gross));
      onFeedback("Gross score must be a positive whole number");
      return;
    }
    if (next !== gross) {
      void runAction(
        onScore(next),
        `Hole ${String(hole.number)} score updated`,
        onFeedback,
      );
    }
  };

  return (
    <div className="join w-full">
      <button
        aria-label={`Decrease score for hole ${String(hole.number)}`}
        className="btn join-item btn-square min-h-11 btn-primary"
        disabled={disabled || stepGross === 1}
        onClick={() => {
          void runAction(
            onScore(Math.max(1, stepGross - 1)),
            `Hole ${String(hole.number)} score updated`,
            onFeedback,
          );
        }}
        onPointerDown={preventInputBlur}
        type="button"
      >
        <MinusCircleIcon aria-hidden="true" size={18} weight="bold" />
      </button>
      <input
        aria-label={`Gross score for hole ${String(hole.number)}`}
        className="input join-item min-h-11 min-w-0 flex-1 text-center font-bold tabular-nums"
        disabled={disabled}
        inputMode="numeric"
        min="1"
        onBlur={commitInput}
        onChange={(event) => {
          setInputValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        placeholder="—"
        type="number"
        value={inputValue}
      />
      <button
        aria-label={`Increase score for hole ${String(hole.number)}`}
        className="btn join-item btn-square min-h-11 btn-primary"
        disabled={disabled}
        onClick={() => {
          void runAction(
            onScore(getIncreasedGross(inputValue, gross, hole.par)),
            `Hole ${String(hole.number)} score updated`,
            onFeedback,
          );
        }}
        onPointerDown={preventInputBlur}
        type="button"
      >
        <PlusCircleIcon aria-hidden="true" size={18} weight="bold" />
      </button>
    </div>
  );
};

export const StablefordHoleEditor = ({
  disabled,
  hole,
  onClear,
  onFeedback,
  onPickup,
  onScore,
  result,
  shotsSubject = "You receive",
}: StablefordHoleEditorProperties) => (
  <article className="card border border-base-300 bg-base-100">
    <div className="card-body gap-3 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="card-title text-lg">Hole {hole.number}</h3>
          <p className="text-xs text-base-content/65">
            Par {hole.par} | SI {hole.strokeIndex} | {hole.yards} yards
          </p>
          <p className="text-xs font-semibold text-primary">
            {shotsSubject} {formatShots(result.strokesReceived)}
          </p>
        </div>
        <div className="text-right text-sm">
          <strong className="block text-xl tabular-nums">
            {result.completed ? formatPoints(result.points) : "—"}
          </strong>
          <span className="text-xs text-base-content/65">
            {getResultLabel(result)}
          </span>
        </div>
      </div>
      <StablefordScoreInput
        disabled={disabled}
        hole={hole}
        key={result.status === "scored" ? String(result.gross) : result.status}
        onClear={onClear}
        onFeedback={onFeedback}
        onScore={onScore}
        result={result}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          aria-label={`Pick up for 0 points on hole ${String(hole.number)}`}
          aria-pressed={result.status === "picked-up"}
          className={
            result.status === "picked-up"
              ? "btn btn-sm btn-warning"
              : "btn btn-ghost btn-sm"
          }
          disabled={disabled}
          onClick={() => {
            void runAction(
              onPickup(),
              `Hole ${String(hole.number)} marked as picked up`,
              onFeedback,
            );
          }}
          type="button"
        >
          <FlagIcon aria-hidden="true" size={16} weight="duotone" />
          Pick up / 0 pts
        </button>
        <button
          aria-label={`Clear hole ${String(hole.number)}`}
          className="btn btn-ghost btn-sm"
          disabled={disabled || result.status === "unplayed"}
          onClick={() => {
            void runAction(
              onClear(),
              `Hole ${String(hole.number)} score cleared`,
              onFeedback,
            );
          }}
          type="button"
        >
          <EraserIcon aria-hidden="true" size={16} weight="duotone" />
          Clear
        </button>
      </div>
      {disabled && (
        <p className="text-xs font-semibold text-warning">
          This hole is locked by the organizer.
        </p>
      )}
    </div>
  </article>
);
