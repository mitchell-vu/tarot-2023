import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CardPage, HomePage } from "@/pages";
import { Header } from "@/components";

const App: React.FC = () => {
  const motionEl = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <Header />
      <main>
        <div ref={motionEl} className="app-motion" />
        <div className="app-inner">
          <Routes>
            <Route path="*" element={<Navigate to="/" />} />

            <Route path="/" element={<HomePage />} />
            <Route path="card/:id" element={<CardPage />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default App;
