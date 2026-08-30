import { SignInIcon } from "@phosphor-icons/react/SignIn";
import { UserCircleIcon } from "@phosphor-icons/react/UserCircle";
import { useForm } from "react-hook-form";

import { authenticateStablefordPlayer } from "./auth";
import {
  STABLEFORD_CONFIG,
  STABLEFORD_EVENT_CODE,
  type StablefordPlayer,
} from "./config";
import { Panel } from "../../components/Panel";
import { SectionHeading } from "../../components/SectionHeading";

interface StablefordLoginForm {
  password: string;
  username: string;
}

interface StablefordLoginProperties {
  onAuthenticated: (player: StablefordPlayer) => void;
}

export const StablefordLogin = ({
  onAuthenticated,
}: StablefordLoginProperties) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<StablefordLoginForm>({
    defaultValues: { password: "", username: "" },
  });

  return (
    <Panel>
      <div>
        <SectionHeading icon={UserCircleIcon} title="Stableford Player Login" />
        <p className="text-sm text-base-content/70">
          Sign in with your displayed name for both username and password.
          Spaces and capital letters do not matter.
        </p>
      </div>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          void handleSubmit(({ password, username }) => {
            const player = authenticateStablefordPlayer(username, password);
            if (player === undefined) {
              setError("password", {
                message: "Username or password is incorrect.",
                type: "validate",
              });
              return;
            }

            onAuthenticated(player);
            globalThis.location.assign(
              `?event=${STABLEFORD_EVENT_CODE}&mode=stableford`,
            );
          })(event);
        }}
      >
        <label>
          <span className="mb-1 block text-sm font-semibold">Username</span>
          <input
            autoCapitalize="none"
            autoComplete="username"
            className="input w-full"
            {...register("username", { required: "Enter your username." })}
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Password</span>
          <input
            autoComplete="current-password"
            className="input w-full"
            type="password"
            {...register("password", { required: "Enter your password." })}
          />
        </label>
        {(errors.username !== undefined || errors.password !== undefined) && (
          <p className="text-sm text-error sm:col-span-2" role="alert">
            {errors.username?.message ??
              errors.password?.message ??
              "Unable to sign in."}
          </p>
        )}
        <button className="btn btn-primary sm:col-span-2" type="submit">
          <SignInIcon aria-hidden="true" size={18} weight="duotone" />
          Open My Scorecard
        </button>
      </form>
      <p className="text-xs text-base-content/60">
        {STABLEFORD_CONFIG.players.length} players are registered for this
        event.
      </p>
    </Panel>
  );
};
