import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Courts from './pages/Courts';
import About from './pages/About';
import Resources from './pages/Resources';
import { ROUTES } from './utils/constants';

function App() {
  return (
    <Router basename="/picklemaster-tw">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LEARNING} element={<Learning />} />
            <Route path={ROUTES.COURTS} element={<Courts />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.RESOURCES} element={<Resources />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
