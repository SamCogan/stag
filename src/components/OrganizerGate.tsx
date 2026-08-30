import { LockIcon } from "@phosphor-icons/react/Lock";
import { LockKeyIcon } from "@phosphor-icons/react/LockKey";
import { LockOpenIcon } from "@phosphor-icons/react/LockOpen";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Panel } from "./Panel";
import { SectionHeading } from "./SectionHeading";

import type { ReactNode } from "react";

const ORGANIZER_PASSWORD = "cogee88";
const ORGANIZER_SESSION_KEY = "organizer-auth-v1";

interface OrganizerForm {
  password: string;
}

interface OrganizerGateProperties {
  children: ReactNode;
}

const readOrganizerAccess = (): boolean =>
  globalThis.sessionStorage.getItem(ORGANIZER_SESSION_KEY) === "ok";

export const OrganizerGate = ({ children }: OrganizerGateProperties) => {
  const [isUnlocked, setIsUnlocked] = useState(readOrganizerAccess);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<OrganizerForm>({ defaultValues: { password: "" } });

  if (isUnlocked) {
    return (
      <>
        <div className="flex justify-end">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              globalThis.sessionStorage.removeItem(ORGANIZER_SESSION_KEY);
              setIsUnlocked(false);
              reset();
            }}
            type="button"
          >
            <LockIcon aria-hidden="true" size={16} />
            Lock Organizer
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <Panel className="mx-auto w-full max-w-md">
      <div>
        <SectionHeading icon={LockKeyIcon} title="Organizer Access" />
        <p className="text-sm text-base-content/70">
          Enter organizer password to access this page.
        </p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          void handleSubmit(({ password }) => {
            if (password !== ORGANIZER_PASSWORD) {
              setError("password", {
                message: "Wrong organizer password.",
                type: "validate",
              });
              return;
            }
            globalThis.sessionStorage.setItem(ORGANIZER_SESSION_KEY, "ok");
            setIsUnlocked(true);
          })(event);
        }}
      >
        <label>
          <span className="mb-1 block text-sm font-semibold">
            Organizer Password
          </span>
          <input
            autoComplete="current-password"
            className="input w-full"
            type="password"
            {...register("password", { required: "Enter the password." })}
          />
        </label>
        {errors.password !== undefined && (
          <p className="text-sm text-error" role="alert">
            {errors.password.message}
          </p>
        )}
        <button className="btn btn-primary" type="submit">
          <LockOpenIcon aria-hidden="true" size={18} weight="duotone" />
          Unlock Organizer Page
        </button>
      </form>
    </Panel>
  );
};
