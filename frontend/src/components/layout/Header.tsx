import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/axios';
import {
    notificationsApi,
    type NotificationItem,
} from '../../api/notifications.api';
import logo from '../../assets/auth/logo.png';
import flagUs from '../../assets/auth/flag-us.png';
import bellIcon from '../../assets/auth/bell.png';
import cartIcon from '../../assets/auth/cart.png';
import './header.css';
import { CreateNewsModal } from '../company-news/CreateNewsModal';

function formatNotificationTime(value: string) {
    const date = new Date(value);

    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function Header() {
    const { openAuthModal, isAuthenticated } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasCompany, setHasCompany] = useState(false);
    const [isCheckingCompany, setIsCheckingCompany] = useState(false);

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
    const [myCompanyId, setMyCompanyId] = useState<string | null>(null); 
    const notificationsRef = useRef<HTMLDivElement | null>(null);

    const { subtotal, hasItems } = useCart();
    const hasNewCartItems = hasItems;
    const cartTotal = subtotal === 0 ? '$00.00' : `$${subtotal.toFixed(2)}`;

    const unreadCount = useMemo(() => {
        return notifications.filter((item) => !item.isRead).length;
    }, [notifications]);

    const hasNewNotifications = unreadCount > 0;

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
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target as Node)
            ) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchMyCompany = async () => {
            if (!isAuthenticated) {
    setHasCompany(false);
    setMyCompanyId(null);
    setIsCheckingCompany(false);
    return;
}

            try {
                setIsCheckingCompany(true);
                const { data } = await api.get('/companies/my');
setHasCompany(true);

setMyCompanyId(data.id);
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
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

    useEffect(() => {
    let intervalId: number | undefined;

    const fetchNotifications = async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            return;
        }

        try {
            const data = await notificationsApi.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    if (!isAuthenticated) {
        setNotifications([]);
        return;
    }

    fetchNotifications();

    intervalId = window.setInterval(() => {
        fetchNotifications();
    }, 10000);

    return () => {
        if (intervalId) {
            window.clearInterval(intervalId);
        }
    };
}, [isAuthenticated]);

    const handleBellClick = async () => {
        if (!isAuthenticated) return;

        const nextOpen = !isNotificationsOpen;
        setIsNotificationsOpen(nextOpen);

        if (!nextOpen) return;

        try {
            setIsNotificationsLoading(true);

            const data = await notificationsApi.getMyNotifications();
            setNotifications(data);

            if (data.some((item) => !item.isRead)) {
                await notificationsApi.markAllAsRead();

                setNotifications((prev) =>
                    prev.map((item) => ({
                        ...item,
                        isRead: true,
                    })),
                );
            }
        } catch (error) {
            console.error('Failed to open notifications:', error);
        } finally {
            setIsNotificationsLoading(false);
        }
    };

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
<div className="header__news-popover">
    {!isCheckingCompany && hasCompany && (
        <button
            className="header__nav-btn"
            type="button"
            onClick={() => {
                setIsCreateNewsOpen((prev) => !prev);
                closeMenu();
            }}
        >
            Create News
        </button>
    )}

    <CreateNewsModal
        isOpen={isCreateNewsOpen}
        companyId={myCompanyId}
        onClose={() => setIsCreateNewsOpen(false)}
    />
</div>
                            {!isCheckingCompany && (
                                <Link
                                    to={
                                        hasCompany
                                            ? '/create-event'
                                            : '/create-company'
                                    }
                                    className="header__nav-link"
                                    onClick={closeMenu}
                                >
                                    {hasCompany
                                        ? 'Create Event'
                                        : 'Create Company'}
                                </Link>
                            )}

                            <Link
                                to="/account"
                                className="header__nav-link"
                                onClick={closeMenu}
                            >
                                Account
                            </Link>

                            <div
                                className="header__notifications"
                                ref={notificationsRef}
                            >
                                <button
                                    className="header__icon-btn header__icon-btn--bell"
                                    type="button"
                                    onClick={handleBellClick}
                                >
                                    <img
                                        src={bellIcon}
                                        alt="Notifications"
                                        className="header__icon"
                                    />
                                    {hasNewNotifications && (
                                        <>
                                            <span className="header__dot" />
                                        </>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <div className="header__notifications-popover">
                                        {isNotificationsLoading ? (
                                            <div className="header__notifications-empty">
                                                Loading...
                                            </div>
                                        ) : notifications.length > 0 ? (
                                            <div className="header__notifications-list">
                                                {notifications
                                                    .slice(0, 6)
                                                    .map((notification) => (
                                                        <button
                                                            key={
                                                                notification.id
                                                            }
                                                            type="button"
                                                            className={`header__notification-item ${
                                                                notification.isRead
                                                                    ? 'is-read'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="header__notification-title">
                                                                {
                                                                    notification.title
                                                                }
                                                            </div>
                                                            <div className="header__notification-body">
                                                                {
                                                                    notification.body
                                                                }
                                                            </div>
                                                            <div className="header__notification-time">
                                                                {formatNotificationTime(
                                                                    notification.createdAt,
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="header__notifications-empty">
                                                No notifications yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

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
