import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Route, Routes} from "react-router-dom";
import {Four04Page} from "./pages/404";
import {Layout} from "./Layout";
import {Home} from "./pages/Home";
import { Invitation } from './pages/Invitation';
import { Profile } from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='/invitation' element={<Invitation />} />;
        <Route path='/profile' element={<Profile />} />;
        <Route path="*" element={<Four04Page />} />
      </Route>
    </Routes>
  );
}

export default App;
