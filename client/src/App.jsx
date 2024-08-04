import React from "react";
import {Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EditPage from "./components/EditPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor/:roomid" element={<EditPage />} />
    </Routes>
  );
}

export default App;
