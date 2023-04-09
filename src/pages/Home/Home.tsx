import * as React from "react";
import WelcomeView from "./HomeView";
import SpreadView from "./SpreadView";

interface IHomePageProps {}

export const HomePage: React.FC<IHomePageProps> = (props) => {
  const [view, setView] = React.useState<"home" | "spread">("home");

  return view === "home" ? <WelcomeView toggleView={() => setView("spread")} /> : <SpreadView />;
};

export default HomePage;
