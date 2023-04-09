import * as React from "react";
import HomeView from "./HomeView";
import SpreadView from "./SpreadView";
import { useStore } from "@/context/store";

interface IHomePageProps {}

export const HomePage: React.FC<IHomePageProps> = (props) => {
  const store = useStore();

  return store?.homeView === "home" ? <HomeView /> : <SpreadView />;
};

export default HomePage;
