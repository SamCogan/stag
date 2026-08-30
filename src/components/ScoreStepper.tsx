import { MinusCircleIcon } from "@phosphor-icons/react/MinusCircle";
import { PlusCircleIcon } from "@phosphor-icons/react/PlusCircle";

interface ScoreStepperProperties {
  ariaLabel: string;
  disabled?: boolean;
  minimum?: number;
  onChange: (value: number) => void;
  value: number;
}

export const ScoreStepper = ({
  ariaLabel,
  disabled = false,
  minimum = 1,
  onChange,
  value,
}: ScoreStepperProperties) => (
  <div className="join shrink-0">
    <button
      aria-label={`Decrease ${ariaLabel}`}
      className="btn join-item btn-square min-h-11 btn-primary"
      disabled={disabled || value <= minimum}
      onClick={() => {
        onChange(Math.max(minimum, value - 1));
      }}
      type="button"
    >
      <MinusCircleIcon aria-hidden="true" size={18} weight="bold" />
    </button>
    <input
      aria-label={ariaLabel}
      className="
        input join-item min-h-11 w-16 text-center font-bold tabular-nums
      "
      disabled={disabled}
      inputMode="numeric"
      min={minimum}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isInteger(next) && next >= minimum) {
          onChange(next);
        }
      }}
      type="number"
      value={value}
    />
    <button
      aria-label={`Increase ${ariaLabel}`}
      className="btn join-item btn-square min-h-11 btn-primary"
      disabled={disabled}
      onClick={() => {
        onChange(value + 1);
      }}
      type="button"
    >
      <PlusCircleIcon aria-hidden="true" size={18} weight="bold" />
    </button>
  </div>
);
