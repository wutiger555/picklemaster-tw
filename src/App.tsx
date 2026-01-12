import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './pages/Home';
import { ROUTES } from './utils/constants';

// Lazy load pages
const Rules = lazy(() => import('./pages/Rules'));
const LevelGuide = lazy(() => import('./pages/LevelGuide'));
const NewcomerGuide = lazy(() => import('./pages/NewcomerGuide'));
const Equipment = lazy(() => import('./pages/Equipment'));
const ProPlayers = lazy(() => import('./pages/ProPlayers'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const Learning = lazy(() => import('./pages/Learning'));
const Courts = lazy(() => import('./pages/Courts'));
const Game = lazy(() => import('./pages/Game'));
const Scorer = lazy(() => import('./pages/Scorer'));
const Resources = lazy(() => import('./pages/Resources'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.NEWCOMER_GUIDE} element={<NewcomerGuide />} />
              <Route path={ROUTES.LEVELS} element={<LevelGuide />} />
              <Route path={ROUTES.RULES} element={<Rules />} />
              <Route path={ROUTES.EQUIPMENT} element={<Equipment />} />
              <Route path={ROUTES.PRO_PLAYERS} element={<ProPlayers />} />
              <Route path={ROUTES.LEARNING_PATHS} element={<LearningPaths />} />
              <Route path={ROUTES.LEARNING} element={<Learning />} />
              <Route path={ROUTES.COURTS} element={<Courts />} />
              <Route path={ROUTES.GAME} element={<Game />} />
              <Route path={ROUTES.SCORER} element={<Scorer />} />
              <Route path={ROUTES.RESOURCES} element={<Resources />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.FAQ} element={<FAQ />} />
              <Route path={ROUTES.NEWS} element={<NewsDetail />} />
              <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
