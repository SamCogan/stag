import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { PlayerHeadshot } from "./PlayerHeadshot";

const SIZES = [
  ["small", 36, "size-9", "text-xs"],
  ["medium", 48, "size-12", "text-sm"],
  ["large", 80, "size-20", "text-xl"],
] as const;

test.each(SIZES)(
  "renders a %s placeholder with initials",
  (size, _pixels, sizeClass, textClass) => {
    const { unmount } = render(
      <PlayerHeadshot initials="AT" name="Ada Tester" size={size} />,
    );

    const placeholder = screen.getByRole("img", {
      name: "Ada Tester placeholder photo",
    });
    expect(placeholder).toHaveTextContent("AT");
    expect(
      [sizeClass, textClass, "grid", "place-items-center"].every((className) =>
        placeholder.classList.contains(className),
      ),
    ).toBe(true);

    unmount();
  },
);

test.each(SIZES)(
  "renders a %s lazy-loaded image at the matching dimensions",
  (size, pixels, sizeClass, textClass) => {
    const { unmount } = render(
      <PlayerHeadshot
        image="/players/ada.webp"
        initials="AT"
        name="Ada Tester"
        size={size}
      />,
    );

    const image = screen.getByRole("img", { name: "Ada Tester" });
    expect(image).toHaveAttribute("src", "/players/ada.webp");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("height", String(pixels));
    expect(image).toHaveAttribute("width", String(pixels));
    expect(
      [sizeClass, textClass, "object-cover"].every((className) =>
        image.classList.contains(className),
      ),
    ).toBe(true);

    unmount();
  },
);

test("uses the medium image size by default", () => {
  const { unmount } = render(
    <PlayerHeadshot
      image="/players/ada.webp"
      initials="AT"
      name="Ada Tester"
    />,
  );

  const image = screen.getByRole("img", { name: "Ada Tester" });
  expect(image).toHaveAttribute("height", "48");
  expect(image).toHaveAttribute("width", "48");
  expect(
    ["size-12", "text-sm"].every((className) =>
      image.classList.contains(className),
    ),
  ).toBe(true);

  unmount();
});
