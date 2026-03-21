//laout/Header.tsx
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import flagUs from '../../assets/flag-us.png';
import bellIcon from '../../assets/bell.png';
import cartIcon from '../../assets/cart.png';
import './header.css';

export function Header() {
    const { openAuthModal, isAuthenticated, logout } = useAuth();

    const hasNewNotifications = true;
    const hasNewCartItems = false;
    const cartTotal = '$00.00';

    return (
        <header className="header">
            <div className="header__inner">
                <div className="header__left">
                    <img src={logo} alt="Tixy" className="header__logo-image" />
                </div>

                <div className="header__right">
                    {!isAuthenticated ? (
                        <>
                            <button
                                className="header__login-btn"
                                onClick={openAuthModal}
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
                            <button className="header__nav-btn" type="button">
                                Create News
                            </button>

                            <button className="header__nav-btn" type="button">
                                Create Event
                            </button>

                            <button className="header__nav-btn" type="button">
                                Account
                            </button>

                            <button
                                className="header__nav-btn"
                                type="button"
                                onClick={logout}
                            >
                                Log out
                            </button>

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
