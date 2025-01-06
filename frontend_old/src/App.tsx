import React from "react";
import { Container } from "@mui/material";
import Nav from "./components/Nav";
import About from "./pages/About";

function App() {
    return (
        <Container>
            <About />
            <Nav />
        </Container>
    );
}

export default App;
