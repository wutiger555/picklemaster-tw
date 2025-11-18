import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Rules from './pages/Rules';
import Equipment from './pages/Equipment';
import LearningPaths from './pages/LearningPaths';
import Learning from './pages/Learning';
import Courts from './pages/Courts';
import Game from './pages/Game';
import Scorer from './pages/Scorer';
import About from './pages/About';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import { ROUTES } from './utils/constants';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.RULES} element={<Rules />} />
            <Route path={ROUTES.EQUIPMENT} element={<Equipment />} />
            <Route path={ROUTES.LEARNING_PATHS} element={<LearningPaths />} />
            <Route path={ROUTES.LEARNING} element={<Learning />} />
            <Route path={ROUTES.COURTS} element={<Courts />} />
            <Route path={ROUTES.GAME} element={<Game />} />
            <Route path={ROUTES.SCORER} element={<Scorer />} />
            <Route path={ROUTES.RESOURCES} element={<Resources />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.FAQ} element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
