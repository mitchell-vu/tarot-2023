import * as React from "react";
import CardView from "./CardView";
import DivinationView from "./DivinationView";
import { useStore } from "@/context/store";

interface ICardPageProps {}

export const CardPage: React.FC<ICardPageProps> = (props) => {
  const store = useStore();

  return store?.cardView === "card" ? <CardView /> : store?.cardView === "divination" ? <DivinationView /> : null;
};

export default CardPage;
