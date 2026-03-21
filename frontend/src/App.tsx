// export default App;
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './pages/HomePage';
import { AccountPage } from './pages/AccountPage';
import { CreateCompanyPage } from './pages/CreateCompanyPage';
import { CreateEventPage } from './pages/CreateEventPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/create-company" element={<CreateCompanyPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
      </Routes>
      <AuthModal />
    </>
  );
}

export default App;
