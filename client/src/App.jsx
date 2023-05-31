import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import socket from "./socket";

import Header from "./components/header";
import Home from "./pages/home";
import Practice from "./pages/practice";
import Global from "./pages/global";
import Friendly from "./pages/friendly";
import PageNotFound from "./pages/pageNotFound.jsx";

import "./index.css";

export default function App() {
  const [socketId, setSocketId] = useState();
  useEffect(() => {
    socket.on("socketId", (id) => setSocketId(id));
    return () => {
      socket.removeEventListener("socketId");
    };
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/global" element={<Global socketId={socketId} />} />
        <Route path="/friendly" element={<Friendly socketId={socketId} />} />
        <Route
          path="/friendly/:id"
          element={<Friendly socketId={socketId} />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}
