// Header.tsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import logo from '../../assets/auth/logo.png';
import flagUs from '../../assets/auth/flag-us.png';
import bellIcon from '../../assets/auth/bell.png';
import cartIcon from '../../assets/auth/cart.png';
import './header.css';

export function Header() {
    const { openAuthModal, isAuthenticated } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasCompany, setHasCompany] = useState(false);
    const [isCheckingCompany, setIsCheckingCompany] = useState(false);

    const hasNewNotifications = true;
    const hasNewCartItems = false;
    const cartTotal = '$00.00';

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchMyCompany = async () => {
            if (!isAuthenticated) {
                setHasCompany(false);
                setIsCheckingCompany(false);
                return;
            }

            try {
                setIsCheckingCompany(true);
                await api.get('/companies/my');
                setHasCompany(true);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setHasCompany(false);
                } else {
                    console.error('Failed to fetch my company:', error);
                    setHasCompany(false);
                }
            } finally {
                setIsCheckingCompany(false);
            }
        };

        fetchMyCompany();
    }, [isAuthenticated]);

    return (
        <header className="header">
            <div className="header__inner">
                <div className="header__left">
                    <Link to="/" onClick={closeMenu}>
                        <img
                            src={logo}
                            alt="Tixy"
                            className="header__logo-image"
                        />
                    </Link>
                </div>

                <button
                    className={`header__burger ${isMenuOpen ? 'header__burger--active' : ''}`}
                    type="button"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                    onClick={toggleMenu}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    className={`header__right ${isMenuOpen ? 'header__right--open' : ''}`}
                >
                    {!isAuthenticated ? (
                        <>
                            <button
                                className="header__login-btn"
                                onClick={() => {
                                    openAuthModal();
                                    closeMenu();
                                }}
                            >
                                Log in
                            </button>

                            <button className="header__country" type="button">
                                <span className="header__country-text">US</span>
                                <img
                                    src={flagUs}
                                    alt="US flag"
                                    className="header__country-flag"
                                />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                className="header__nav-link"
                                onClick={closeMenu}
                            >
                                Home Page
                            </Link>

                            <button className="header__nav-btn" type="button">
                                Create News
                            </button>

                            {!isCheckingCompany && (
                                <Link
                                    to={hasCompany ? '/create-event' : '/create-company'}
                                    className="header__nav-link"
                                    onClick={closeMenu}
                                >
                                    {hasCompany ? 'Create Event' : 'Create Company'}
                                </Link>
                            )}

                            <Link
                                to="/account"
                                className="header__nav-link"
                                onClick={closeMenu}
                            >
                                Account
                            </Link>

                            <button
                                className="header__icon-btn header__icon-btn--bell"
                                type="button"
                            >
                                <img
                                    src={bellIcon}
                                    alt="Notifications"
                                    className="header__icon"
                                />
                                {hasNewNotifications && (
                                    <span className="header__dot" />
                                )}
                            </button>

                            <button className="header__cart" type="button">
                                <span className="header__cart-price">
                                    {cartTotal}
                                </span>

                                <span className="header__cart-icon-wrap">
                                    <img
                                        src={cartIcon}
                                        alt="Cart"
                                        className="header__icon"
                                    />
                                    {hasNewCartItems && (
                                        <span className="header__dot header__dot--cart" />
                                    )}
                                </span>
                            </button>

                            <button className="header__country" type="button">
                                <span className="header__country-text">US</span>
                                <img
                                    src={flagUs}
                                    alt="US flag"
                                    className="header__country-flag"
                                />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
