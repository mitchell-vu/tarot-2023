import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CardPage, HomePage } from "./pages";
import Header from "./components/Header/Header";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main>
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
