import React from "react";
import { RawCard } from "@/vite-env";

type HomeView = "home" | "spread";
type CardView = "card" | "divination";

declare interface Store {
  cards: Array<RawCard>;
  homeView: HomeView;
  cardView: CardView;
  setView: (value: HomeView | CardView, key: "home" | "card") => void;
  setCards: (cards: Array<RawCard>) => void;
  getCards: (id: string) => RawCard | undefined;
  isLoading: boolean;
  isBlockBtn: boolean;
  setBlockBtn: (flag: boolean) => void;
  finishLoading: () => void;
}

export const StoreContext = React.createContext<Store | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = React.useState<RawCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [homeView, setHomeView] = React.useState<HomeView>("home");
  const [cardView, setCardView] = React.useState<CardView>("card");
  const [isBlockBtn, setIsBlockBtn] = React.useState(false);

  const getCards = (id: string) => {
    return cards.find(({ id: cardId }) => cardId === id);
  };

  const finishLoading = () => {
    setIsLoading(false);
  };

  const setView = (value: HomeView | CardView, key: "home" | "card") => {
    if (key === "home" && (value === "home" || value === "spread")) {
      setHomeView(value);
    }
    if (key === "card" && (value === "card" || value === "divination")) {
      setCardView(value);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cards,
        setCards,
        getCards,
        isLoading,
        finishLoading,
        homeView,
        cardView,
        setView,
        isBlockBtn,
        setBlockBtn: setIsBlockBtn,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => React.useContext(StoreContext);
