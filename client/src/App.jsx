import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Tutorial from "./pages/tutorial";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Login from './pages/Login';
import Register from './pages/Register';
import NoPage from "./pages/NoPage";

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';


function App() {
  return (
    <>
      <MantineProvider>
        <BrowserRouter basename="/assignment2">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="tutorials" element={<Tutorials />} />
              <Route path="categories" element={<Categories />} />
              <Route path="materials" element={<Materials />} />
              <Route path="about" element={<About />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </>
  )
}

export default App;
