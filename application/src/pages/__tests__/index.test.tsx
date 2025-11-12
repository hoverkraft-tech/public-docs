import type { ComponentType, ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RouteContextProvider } from "@docusaurus/core/lib/client/routeContext";
import { HelmetProvider } from "react-helmet-async";
import { TitleFormatterProvider } from "@docusaurus/theme-common/internal";

type TitleFormatterParams = {
  title: string;
  siteTitle: string;
  titleDelimiter: string;
  plugin: { id: string; name: string };
};

type TitleFormatterFnWithDefault = (
  params: TitleFormatterParams & {
    defaultFormatter: (params: TitleFormatterParams) => string;
  }
) => string;
import Home, { HeroSection, ValuePropsSection, ProjectsSection } from "../index";

const TypedRouteProvider = RouteContextProvider as ComponentType<{
  value: { plugin: { name: string; id: string }; data: Record<string, unknown> };
  children?: ReactNode;
}>;

const passthroughTitleFormatter: TitleFormatterFnWithDefault = ({ defaultFormatter, ...params }) =>
  defaultFormatter(params);

const RouterProviders = ({ children }: { children?: ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>
      <TypedRouteProvider value={{ plugin: { name: "test", id: "default" }, data: {} }}>
        <TitleFormatterProvider formatter={passthroughTitleFormatter} children={children ?? null} />
      </TypedRouteProvider>
    </MemoryRouter>
  </HelmetProvider>
);

const renderWithRouter = (ui: ReactElement) => render(ui, { wrapper: RouterProviders });

describe("HeroSection", () => {
  it("renders all primary calls to action", () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText("Discover documentation")).toBeInTheDocument();
    expect(screen.getByText("Explore Projects")).toBeInTheDocument();
    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
  });
});

describe("ValuePropsSection", () => {
  it("lists each Hoverkraft differentiator", () => {
    renderWithRouter(<ValuePropsSection />);

    ["Open Source", "Developer First", "Community", "Innovation"].forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});

describe("ProjectsSection", () => {
  it("describes the flagship projects", () => {
    renderWithRouter(<ProjectsSection />);

    ["compose-action", "ci-dokumentor", "ci-github-container"].forEach((project) => {
      expect(screen.getByText(project)).toBeInTheDocument();
    });
  });
});

describe("Home", () => {
  it("renders the hero section inside the composed layout", () => {
    renderWithRouter(<Home />);

    expect(screen.getByText("Discover documentation")).toBeInTheDocument();
  });
});
