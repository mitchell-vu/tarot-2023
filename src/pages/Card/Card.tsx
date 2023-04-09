import * as React from "react";
import CardView from "./CardView";
import DivinationView from "./DivinationView";

interface ICardPageProps {}

export const CardPage: React.FC<ICardPageProps> = (props) => {
  const [pageView, setPageView] = React.useState<"card" | "divination">("card");

  return pageView === "card" ? <CardView /> : pageView === "divination" ? <DivinationView /> : null;
};

export default CardPage;
