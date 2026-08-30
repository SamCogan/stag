import { ClipboardTextIcon } from "@phosphor-icons/react/ClipboardText";
import { SignInIcon } from "@phosphor-icons/react/SignIn";
import { UsersThreeIcon } from "@phosphor-icons/react/UsersThree";
import { useForm } from "react-hook-form";

import { Panel } from "./Panel";
import { SectionHeading } from "./SectionHeading";
import { PUB_EVENT } from "../config/pubGolf";

import type { TeamId } from "../config/eventSchemas";

type Activity = "pub" | "scramble";

interface TeamLoginForm {
  activity: Activity;
  password: string;
  teamId: TeamId;
}

const activityRoute: Readonly<
  Record<Activity, { eventCode: string; mode: string }>
> = {
  pub: { eventCode: "stag2026", mode: "captain" },
  scramble: { eventCode: "vilasol", mode: "scramble" },
};

export const TeamLogin = () => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<TeamLoginForm>({
    defaultValues: { activity: "pub", password: "", teamId: "A" },
  });

  return (
    <Panel>
      <div>
        <SectionHeading
          badgeIcon={SignInIcon}
          icon={UsersThreeIcon}
          title="Team Login"
        />
        <p className="text-sm text-base-content/70">
          Open the scoring view for one team.
        </p>
      </div>
      <form
        className="grid gap-3 sm:grid-cols-3"
        onSubmit={(event) => {
          void handleSubmit(({ activity, password, teamId }) => {
            if (password.trim() !== PUB_EVENT.teams[teamId].key) {
              setError("password", {
                message: "Wrong team password.",
                type: "validate",
              });
              return;
            }
            const route = activityRoute[activity];
            const query = new URLSearchParams({
              event: route.eventCode,
              key: PUB_EVENT.teams[teamId].key,
              mode: route.mode,
              team: teamId,
            });
            globalThis.location.assign(`?${query.toString()}`);
          })(event);
        }}
      >
        <label>
          <span className="mb-1 block text-sm font-semibold">Game Type</span>
          <select className="select w-full" {...register("activity")}>
            <option value="pub">Pub Golf</option>
            <option value="scramble">Vila Sol Scramble</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Team</span>
          <select className="select w-full" {...register("teamId")}>
            <option value="A">Team 1</option>
            <option value="B">Team 2</option>
            <option value="C">Team 3</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">
            Team Password
          </span>
          <input
            autoComplete="current-password"
            className="input w-full"
            type="password"
            {...register("password", { required: "Enter the team password." })}
          />
        </label>
        {errors.password !== undefined && (
          <p className="text-sm text-error sm:col-span-3" role="alert">
            {errors.password.message}
          </p>
        )}
        <button className="btn btn-primary sm:col-span-3" type="submit">
          <ClipboardTextIcon aria-hidden="true" size={18} weight="duotone" />
          Open Team Scoring
        </button>
      </form>
    </Panel>
  );
};
