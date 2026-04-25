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
const Tournaments = lazy(() => import('./pages/Tournaments'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Ratings = lazy(() => import('./pages/Ratings'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Techniques = lazy(() => import('./pages/Techniques'));
const TechniqueDetail = lazy(() => import('./pages/TechniqueDetail'));
const CourtDetail = lazy(() => import('./pages/CourtDetail'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
const History = lazy(() => import('./pages/History'));
const PaddleDatabase = lazy(() => import('./pages/PaddleDatabase'));
const Videos = lazy(() => import('./pages/Videos'));
const TrainingPrograms = lazy(() => import('./pages/TrainingPrograms'));
const TrainingProgramDetail = lazy(() => import('./pages/TrainingProgramDetail'));
const Playbook = lazy(() => import('./pages/Playbook'));
const HallOfFame = lazy(() => import('./pages/HallOfFame'));
const Tools = lazy(() => import('./pages/Tools'));
const DuprSimulator = lazy(() => import('./pages/tools/DuprSimulator'));
const RotationScheduler = lazy(() => import('./pages/tools/RotationScheduler'));
const BracketGenerator = lazy(() => import('./pages/tools/BracketGenerator'));
const CourtLinesGuide = lazy(() => import('./pages/tools/CourtLinesGuide'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));

// Lenis Smooth Scroll
import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up
    return () => {
      lenis.destroy();
    };
  }, []);

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
              <Route path={ROUTES.TOURNAMENTS} element={<Tournaments />} />
              <Route path={ROUTES.GLOSSARY} element={<Glossary />} />
              <Route path={ROUTES.RATINGS} element={<Ratings />} />
              <Route path={ROUTES.ARTICLES} element={<Articles />} />
              <Route path={ROUTES.ARTICLE_DETAIL} element={<ArticleDetail />} />
              <Route path={ROUTES.TECHNIQUES} element={<Techniques />} />
              <Route path={ROUTES.TECHNIQUE_DETAIL} element={<TechniqueDetail />} />
              <Route path={ROUTES.COURT_DETAIL} element={<CourtDetail />} />
              <Route path={ROUTES.PLAYER_DETAIL} element={<PlayerDetail />} />
              <Route path={ROUTES.HISTORY} element={<History />} />
              <Route path={ROUTES.PADDLE_DATABASE} element={<PaddleDatabase />} />
              <Route path={ROUTES.VIDEOS} element={<Videos />} />
              <Route path={ROUTES.TRAINING_PROGRAMS} element={<TrainingPrograms />} />
              <Route path={ROUTES.TRAINING_PROGRAM_DETAIL} element={<TrainingProgramDetail />} />
              <Route path={ROUTES.PLAYBOOK} element={<Playbook />} />
              <Route path={ROUTES.HALL_OF_FAME} element={<HallOfFame />} />
              <Route path={ROUTES.TOOLS} element={<Tools />} />
              <Route path={ROUTES.TOOL_DUPR} element={<DuprSimulator />} />
              <Route path={ROUTES.TOOL_ROTATION} element={<RotationScheduler />} />
              <Route path={ROUTES.TOOL_BRACKET} element={<BracketGenerator />} />
              <Route path={ROUTES.TOOL_COURT_LINES} element={<CourtLinesGuide />} />
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
