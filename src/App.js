import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Album from "./components/Album";
import Register from "./components/Register";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/album" element={<Album />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
