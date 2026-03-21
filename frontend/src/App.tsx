//src/App.tsx
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './pages/HomePage';
import { GoogleAuthSuccessPage } from './pages/GoogleAuthSuccessPage';

function App() {
    const pathname = window.location.pathname;

    if (pathname === '/auth/google/success') {
        return <GoogleAuthSuccessPage />;
    }

    return (
        <>
            <Header />
            <HomePage />
            <AuthModal />
        </>
    );
}

export default App;
