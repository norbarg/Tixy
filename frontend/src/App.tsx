import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <>
      <Header />
      <HomePage />
      <AuthModal />
    </>
  );
}

export default App;
