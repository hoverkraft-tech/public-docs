import { render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import Home, {
  HeroSection,
  ProjectsSection,
  ValuePropsSection,
} from "../index";

vi.mock("@hoverkraft/docusaurus-theme/components", () => ({
  HoverkraftBrandHighlight: ({ children }: PropsWithChildren) => (
    <span>{children}</span>
  ),
  HoverkraftButton: ({ label }: { href: string; label: string }) => (
    <button type="button">{label}</button>
  ),
  HoverkraftFeatureList: ({
    features,
  }: {
    features: Array<{ description: string; title: string }>;
  }) => (
    <ul>
      {features.map((feature) => (
        <li key={feature.title}>
          <span>{feature.title}</span>
          <span>{feature.description}</span>
        </li>
      ))}
    </ul>
  ),
  HoverkraftHero: ({
    actions,
    description,
    title,
  }: {
    actions: Array<{ href?: string; label: string; to?: string }>;
    description: string;
    title: ReactNode;
  }) => (
    <section>
      <div>{title}</div>
      <p>{description}</p>
      {actions.map((action) => (
        <button key={action.label} type="button">
          {action.label}
        </button>
      ))}
    </section>
  ),
  HoverkraftProjectCard: ({
    description,
    meta,
    tags,
    title,
    titleHref,
  }: {
    description: string;
    meta: string;
    tags: string[];
    title: string;
    titleHref: string;
  }) => (
    <article>
      <span data-title-href={titleHref}>{title}</span>
      <div>{meta}</div>
      <p>{description}</p>
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </article>
  ),
}));

describe("HeroSection", () => {
  it("renders all primary calls to action", () => {
    render(<HeroSection />);

    expect(screen.getByText("Discover documentation")).toBeInTheDocument();
    expect(screen.getByText("Explore Projects")).toBeInTheDocument();
    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
  });
});

describe("ValuePropsSection", () => {
  it("lists each Hoverkraft differentiator", () => {
    render(<ValuePropsSection />);

    for (const title of [
      "Open Source",
      "Developer First",
      "Community",
      "Innovation",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });
});

describe("ProjectsSection", () => {
  it("describes the flagship projects", () => {
    render(<ProjectsSection />);

    for (const project of [
      "compose-action",
      "ci-dokumentor",
      "ci-github-container",
    ]) {
      expect(screen.getByText(project)).toBeInTheDocument();
    }
  });
});

describe("Home", () => {
  it("renders the hero section inside the composed layout", () => {
    render(<Home />);

    expect(screen.getByText("Discover documentation")).toBeInTheDocument();
    expect(screen.getByTestId("layout")).toHaveAttribute(
      "data-description",
      "Test tagline",
    );
  });
});
