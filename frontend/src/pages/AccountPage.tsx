// AcountPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users.api';
import { companiesApi } from '../api/companies.api';
import { ordersApi } from '../api/orders.api';
import { eventsApi } from '../api/events.api';
import { commentsApi } from '../api/comments.api';
import type { Company } from '../types/company.types';
import type { OrderItem } from '../types/order.types';
import type { User } from '../types/auth.types';
import type { EventItem } from '../types/event.types';
import type { CommentItem } from '../types/comment.types';
import { EventCard } from '../components/home/EventCard';

import ordersDefaultIcon from '../assets/account/orders-default.png';
import ordersHoverIcon from '../assets/account/orders-hover.png';
import ordersActiveIcon from '../assets/account/orders-active.png';

import eventsDefaultIcon from '../assets/account/events-default.png';
import eventsHoverIcon from '../assets/account/events-hover.png';
import eventsActiveIcon from '../assets/account/events-active.png';

import settingsDefaultIcon from '../assets/account/settings-default.png';
import settingsHoverIcon from '../assets/account/settings-hover.png';
import settingsActiveIcon from '../assets/account/settings-active.png';

import adminDefaultIcon from '../assets/account/admin-default.png';
import adminHoverIcon from '../assets/account/admin-hover.png';
import adminActiveIcon from '../assets/account/admin-active.png';

import logoutDefaultIcon from '../assets/account/logout-default.png';
import logoutHoverIcon from '../assets/account/logout-hover.png';
import logoutActiveIcon from '../assets/account/logout-active.png';
import homeArrowIcon from '../assets/account/arrow2.png';
import companyDefaultAvatar from '../assets/account/company-default-avatar.png';
import deleteEventIcon from '../assets/account/delete-event-icon.png';

import './account.css';

type AccountSection = 'orders' | 'events' | 'settings' | 'admin';
type SidebarItemKey = AccountSection | 'logout';

export function AccountPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const contentRef = useRef<HTMLElement | null>(null);

    const [activeSection, setActiveSection] =
        useState<AccountSection>('settings');
    const [hoveredSection, setHoveredSection] = useState<SidebarItemKey | null>(
        null,
    );

    const [isEditingLogin, setIsEditingLogin] = useState(false);
    const [loginValue, setLoginValue] = useState(user?.login ?? '');
    const [settingsError, setSettingsError] = useState('');
    const [settingsLoading, setSettingsLoading] = useState(false);

    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState('');

    const [myEvents, setMyEvents] = useState<EventItem[]>([]);
    const [myEventsLoading, setMyEventsLoading] = useState(true);
    const [myEventsError, setMyEventsError] = useState('');

    const [company, setCompany] = useState<Company | null>(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState('');
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        name: '',
        email: '',
        description: '',
        placeAddress: '',
    });

    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [adminUsersLoading, setAdminUsersLoading] = useState(false);

    const [adminCompanies, setAdminCompanies] = useState<Company[]>([]);
    const [adminCompaniesLoading, setAdminCompaniesLoading] = useState(false);

    const [adminEvents, setAdminEvents] = useState<EventItem[]>([]);
    const [adminEventsLoading, setAdminEventsLoading] = useState(false);

    const [adminComments, setAdminComments] = useState<CommentItem[]>([]);
    const [adminCommentsLoading, setAdminCommentsLoading] = useState(false);

    const [adminError, setAdminError] = useState('');

    const [adminOpenSections, setAdminOpenSections] = useState({
    users: false,
    companies: false,
    events: false,
    comments: false,
});

function toggleAdminSection(
    section: 'users' | 'companies' | 'events' | 'comments',
) {
    setAdminOpenSections((prev) => ({
        ...prev,
        [section]: !prev[section],
    }));
}

    useEffect(() => {
        setLoginValue(user?.login ?? '');
    }, [user]);

    useEffect(() => {
    loadMyCompany();
    loadMyOrders();
    loadMyEvents();
}, []);
//
useEffect(() => {
    if (!myEventsError) return;

    const timer = setTimeout(() => {
        setMyEventsError('');
    }, 3000);

    return () => clearTimeout(timer);
}, [myEventsError]);
//
    useEffect(() => {
        if (!settingsError) return;

        const timer = setTimeout(() => {
            setSettingsError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [settingsError]);

    useEffect(() => {
        if (!ordersError) return;

        const timer = setTimeout(() => {
            setOrdersError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [ordersError]);

    useEffect(() => {
        if (!companyError) return;

        const timer = setTimeout(() => {
            setCompanyError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [companyError]);

    useEffect(() => {
        if (!adminError) return;

        const timer = setTimeout(() => {
            setAdminError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [adminError]);

    useEffect(() => {
        if (activeSection === 'admin' && hasAdminAccess) {
            loadAdminPanelData();
        }
    }, [activeSection]);

    useEffect(() => {
        const root = contentRef.current;
        if (!root) return;

        const elements = root.querySelectorAll('.account-scroll-item');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            {
                root,
                threshold: 0.12,
            },
        );

        elements.forEach((element) => observer.observe(element));

        return () => {
            elements.forEach((element) => observer.unobserve(element));
            observer.disconnect();
        };
    }, [
        activeSection,
        orders,
        company,
        companyLoading,
        ordersLoading,
        adminUsers,
        adminCompanies,
        adminEvents,
        adminComments,
        adminUsersLoading,
        adminCompaniesLoading,
        adminEventsLoading,
        adminCommentsLoading,
        myEvents, 
        myEventsLoading, 
    ]);

    const hasAdminAccess = useMemo(() => user?.role === 'ADMIN', [user]);

    function getSidebarIcon(item: SidebarItemKey) {
        const isActive = item !== 'logout' && activeSection === item;
        const isHovered = hoveredSection === item;

        if (item === 'orders') {
            if (isActive) return ordersActiveIcon;
            if (isHovered) return ordersHoverIcon;
            return ordersDefaultIcon;
        }

        if (item === 'events') {
            if (isActive) return eventsActiveIcon;
            if (isHovered) return eventsHoverIcon;
            return eventsDefaultIcon;
        }

        if (item === 'settings') {
            if (isActive) return settingsActiveIcon;
            if (isHovered) return settingsHoverIcon;
            return settingsDefaultIcon;
        }

        if (item === 'admin') {
            if (isActive) return adminActiveIcon;
            if (isHovered) return adminHoverIcon;
            return adminDefaultIcon;
        }

        if (item === 'logout') {
            if (isActive) return logoutActiveIcon;
            if (isHovered) return logoutHoverIcon;
            return logoutDefaultIcon;
        }

        return ordersDefaultIcon;
    }

    async function handleLogout() {
        await logout();
        navigate('/', { replace: true });
    }

    async function loadMyOrders() {
        try {
            setOrdersLoading(true);
            setOrdersError('');
            const data = await ordersApi.getMyOrders();
            setOrders(data);
        } catch {
            setOrdersError('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    }

    async function loadMyCompany() {
        try {
            setCompanyLoading(true);
            setCompanyError('');
            const data = await companiesApi.getMyCompany();
            setCompany(data);
            setCompanyForm({
                name: data.name ?? '',
                email: data.email ?? '',
                description: data.description ?? '',
                placeAddress: data.placeAddress ?? '',
            });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setCompany(null);
            } else {
                setCompanyError('Failed to load company');
            }
        } finally {
            setCompanyLoading(false);
        }
    }

    async function loadAdminPanelData() {
        try {
            setAdminError('');
            setAdminUsersLoading(true);
            setAdminCompaniesLoading(true);
            setAdminEventsLoading(true);
            setAdminCommentsLoading(true);

            const [users, companies, events, comments] = await Promise.all([
                usersApi.getAllUsers(),
                companiesApi.getAll(),
                eventsApi.getAll(),
                commentsApi.getAllComments(),
            ]);

            setAdminUsers(users);
            setAdminCompanies(companies);
            setAdminEvents(events);
            setAdminComments(comments);
        } catch {
            setAdminError('Failed to load admin panel data');
        } finally {
            setAdminUsersLoading(false);
            setAdminCompaniesLoading(false);
            setAdminEventsLoading(false);
            setAdminCommentsLoading(false);
        }
    }

    async function handleSaveLogin() {
        if (!loginValue.trim()) {
            setSettingsError('Login is required');
            return;
        }

        try {
            setSettingsLoading(true);
            setSettingsError('');
            await usersApi.updateMyLogin(loginValue.trim());
            window.location.reload();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = Array.isArray(err.response?.data?.message)
                    ? err.response?.data?.message[0]
                    : err.response?.data?.message;

                setSettingsError(message || 'Failed to update login');
            } else {
                setSettingsError('Failed to update login');
            }
        } finally {
            setSettingsLoading(false);
            setIsEditingLogin(false);
        }
    }

    async function handleDeleteAccount() {
    try {
        await usersApi.deleteMyAccount();
        await logout();
        navigate('/', { replace: true });
    } catch {
        setSettingsError('Failed to delete account');
    }
}

    async function handleSaveCompany() {
        if (!company) return;

        try {
            const updated = await companiesApi.updateCompany(company.id, {
                name: companyForm.name,
                email: companyForm.email,
                description: companyForm.description,
                placeAddress: companyForm.placeAddress,
            });

            setCompany(updated);
            setIsEditingCompany(false);
            setCompanyError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = Array.isArray(err.response?.data?.message)
                    ? err.response?.data?.message[0]
                    : err.response?.data?.message;

                setCompanyError(message || 'Failed to update company');
            } else {
                setCompanyError('Failed to update company');
            }
        }
    }

    async function handleDeleteCompany() {
        if (!company) return;

        try {
            await companiesApi.deleteCompany(company.id);
            setCompany(null);
            setIsEditingCompany(false);
            setCompanyForm({
                name: '',
                email: '',
                description: '',
                placeAddress: '',
            });
        } catch {
            setCompanyError('Failed to delete company');
        }
    }

    async function handleAdminDeleteUser(id: string) {
        try {
            await usersApi.deleteUserById(id);
            setAdminUsers((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setAdminError('Failed to delete user');
        }
    }

    async function handleAdminDeleteCompany(id: string) {
        try {
            await companiesApi.deleteCompany(id);
            setAdminCompanies((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setAdminError('Failed to delete company');
        }
    }

    async function handleAdminDeleteEvent(id: string) {
        try {
            await eventsApi.deleteEvent(id);
            setAdminEvents((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setAdminError('Failed to delete event');
        }
    }

    async function handleAdminDeleteComment(id: string) {
        try {
            await commentsApi.deleteComment(id);
            setAdminComments((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setAdminError('Failed to delete comment');
        }
    }

    async function loadMyEvents() {
    try {
        setMyEventsLoading(true);
        setMyEventsError('');
        const data = await eventsApi.getMyEvents();
        setMyEvents(data);
    } catch {
        setMyEventsError('Failed to load events');
    } finally {
        setMyEventsLoading(false);
    }
}

async function handleDeleteMyEvent(id: string) {
    try {
        await eventsApi.deleteEvent(id);
        setMyEvents((prev) => prev.filter((item) => item.id !== id));
    } catch {
        setMyEventsError('Failed to delete event');
    }
}

    function formatSingleDate(value: string | null | undefined) {
        if (!value) return '-';

        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);

        return `${day}/${month}/${year}`;
    }

    function formatOrderDate(
        startsAt: string | null | undefined,
        endsAt: string | null | undefined,
    ) {
        if (!startsAt && !endsAt) return '-';
        if (startsAt && !endsAt) return formatSingleDate(startsAt);
        if (!startsAt && endsAt) return formatSingleDate(endsAt);

        return `${formatSingleDate(startsAt)} - ${formatSingleDate(endsAt)}`;
    }

    function formatOrderPrice(value: string) {
        return `$${Number(value).toFixed(2)}`;
    }

    return (
        <main className="account-page">
            <h1 className="account-page__title">Account</h1>

            <div className="account-page__inner">
                <aside className="account-sidebar">
                    <button
                        className={`account-sidebar__item ${
                            activeSection === 'orders' ? 'active' : ''
                        }`}
                        onClick={() => setActiveSection('orders')}
                        onMouseEnter={() => setHoveredSection('orders')}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <span>Orders</span>
                        <img
                            src={getSidebarIcon('orders')}
                            alt=""
                            className="account-sidebar__icon"
                        />
                    </button>

                    <button
                        className={`account-sidebar__item ${
                            activeSection === 'events' ? 'active' : ''
                        }`}
                        onClick={() => setActiveSection('events')}
                        onMouseEnter={() => setHoveredSection('events')}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <span>My Events</span>
                        <img
                            src={getSidebarIcon('events')}
                            alt=""
                            className="account-sidebar__icon"
                        />
                    </button>

                    <button
                        className={`account-sidebar__item ${
                            activeSection === 'settings' ? 'active' : ''
                        }`}
                        onClick={() => setActiveSection('settings')}
                        onMouseEnter={() => setHoveredSection('settings')}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <span>Settings</span>
                        <img
                            src={getSidebarIcon('settings')}
                            alt=""
                            className="account-sidebar__icon"
                        />
                    </button>

                    {hasAdminAccess && (
                        <button
                            className={`account-sidebar__item ${
                                activeSection === 'admin' ? 'active' : ''
                            }`}
                            onClick={() => setActiveSection('admin')}
                            onMouseEnter={() => setHoveredSection('admin')}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            <span>Admin Panel</span>
                            <img
                                src={getSidebarIcon('admin')}
                                alt=""
                                className="account-sidebar__icon"
                            />
                        </button>
                    )}

                    <button
                        className="account-sidebar__item account-sidebar__logout"
                        onClick={handleLogout}
                        onMouseEnter={() => setHoveredSection('logout')}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <span>Log Out</span>
                        <img
                            src={getSidebarIcon('logout')}
                            alt=""
                            className="account-sidebar__icon"
                        />
                    </button>
                </aside>

                <section className="account-content" ref={contentRef}>
                    {activeSection === 'orders' && (
                        <div className="account-block account-scroll-item">
                            {ordersLoading ? (
                                <p className="account-muted">Loading...</p>
                            ) : ordersError ? (
                                <p className="account-error">
                                    Failed to load orders
                                </p>
                            ) : orders.length === 0 ? (
                                <div className="account-empty account-scroll-item">
                                    <p className="account-muted">
                                        OH! You have no orders yet. Choose an
                                        event you want to visit.
                                    </p>
                                    <Link to="/" className="account-home-link">
                                        <span>Go to Home Page</span>
                                        <img
                                            src={homeArrowIcon}
                                            alt=""
                                            className="account-home-link__icon"
                                        />
                                    </Link>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    <div className="orders-head account-scroll-item">
                                        <div>TITLE</div>
                                        <div>QTY</div>
                                        <div>DATE</div>
                                        <div>TOTAL</div>
                                        <div>LOCATION</div>
                                    </div>

                                    {orders.map((order) => (
                                        <div
                                            className="orders-item account-scroll-item"
                                            key={order.id}
                                        >
                                            <div>
                                                {order.event?.title ??
                                                    'Event not found'}
                                            </div>
                                            <div>{order.quantity}</div>
                                            <div>
                                                {formatOrderDate(
                                                    order.event?.startsAt,
                                                    order.event?.endsAt,
                                                )}
                                            </div>
                                            <div>
                                                {formatOrderPrice(
                                                    order.totalPrice,
                                                )}
                                            </div>
                                            <div>
                                                {order.event?.placeAddress ??
                                                    '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeSection === 'events' && (
    <div className="account-block account-scroll-item">
        {myEventsLoading ? (
            <p className="account-muted">Loading...</p>
        ) : myEventsError ? (
            <p className="account-error">{myEventsError}</p>
        ) : myEvents.length > 0 ? (
            <div className="account-events-grid">
                {myEvents.map((event) => (
                    <div
    key={event.id}
    className="account-events-grid__item account-scroll-item"
>
    <div className="account-event-card-wrap">
        <EventCard event={event} />

        <button
            type="button"
            className="account-event-card__delete-overlay"
            onClick={() => handleDeleteMyEvent(event.id)}
            aria-label={`Delete ${event.title}`}
            title="Delete event"
        >
            <span className="account-event-card__delete-backdrop" />
            <img
                src={deleteEventIcon}
                alt=""
                className="account-event-card__delete-icon"
            />
        </button>
    </div>
</div>
                ))}
            </div>
        ) : !companyLoading && !company ? (
            <div className="account-empty account-scroll-item">
                <p className="account-muted">
                    OH! You have no events yet. First, create your company to be
                    able to add an event.
                </p>
                <Link
                    to="/create-company"
                    state={{ section: 'settings' }}
                    className="account-home-link"
                >
                    <span>Go to Company Settings</span>
                    <img
                        src={homeArrowIcon}
                        alt=""
                        className="account-home-link__icon"
                    />
                </Link>
            </div>
        ) : (
            <div className="account-empty account-scroll-item">
                <p className="account-muted">
                    OH! You have no events yet. Create your first event to get
                    started.
                </p>
                <Link to="/create-event" className="account-home-link">
                    <span>Go to Create Event Page</span>
                    <img
                        src={homeArrowIcon}
                        alt=""
                        className="account-home-link__icon"
                    />
                </Link>
            </div>
        )}
    </div>
)}
{activeSection === 'admin' && (
    <div className="account-block account-scroll-item">
        <h2 className="account-block__heading">ADMIN PANEL</h2>

        {adminError ? <p className="account-error">{adminError}</p> : null}

        <div className="admin-accordion">
            <div className="admin-accordion__item">
                <button
                    type="button"
                    className={`admin-accordion__header ${
                        adminOpenSections.users ? 'is-open' : ''
                    }`}
                    onClick={() => toggleAdminSection('users')}
                >
                    <span>Users</span>
                    <span className="admin-accordion__icon">
                        {adminOpenSections.users ? '−' : '+'}
                    </span>
                </button>

                {adminOpenSections.users && (
                    <div className="admin-accordion__body">
                        {adminUsersLoading ? (
                            <p className="account-muted">Loading...</p>
                        ) : adminUsers.length === 0 ? (
                            <p className="account-muted">No users found.</p>
                        ) : (
                            <div className="admin-list">
                                {adminUsers.map((item) => (
                                    <div key={item.id} className="admin-row">
                                        <div className="admin-row__info">
                                            <p>
                                                <strong>Login:</strong>{' '}
                                                {item.login}
                                            </p>
                                            <p>
                                                <strong>Email:</strong>{' '}
                                                {item.email}
                                            </p>
                                            <p>
                                                <strong>Role:</strong>{' '}
                                                {item.role}
                                            </p>
                                        </div>

                                        <button
                                            className="account-danger-btn"
                                            onClick={() =>
                                                handleAdminDeleteUser(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="admin-accordion__item">
                <button
                    type="button"
                    className={`admin-accordion__header ${
                        adminOpenSections.companies ? 'is-open' : ''
                    }`}
                    onClick={() => toggleAdminSection('companies')}
                >
                    <span>Companies</span>
                    <span className="admin-accordion__icon">
                        {adminOpenSections.companies ? '−' : '+'}
                    </span>
                </button>

                {adminOpenSections.companies && (
                    <div className="admin-accordion__body">
                        {adminCompaniesLoading ? (
                            <p className="account-muted">Loading...</p>
                        ) : adminCompanies.length === 0 ? (
                            <p className="account-muted">No companies found.</p>
                        ) : (
                            <div className="admin-list">
                                {adminCompanies.map((item) => (
                                    <div key={item.id} className="admin-row">
                                        <div className="admin-row__info">
                                            <p>
                                                <strong>Name:</strong>{' '}
                                                {item.name}
                                            </p>
                                            <p>
                                                <strong>Email:</strong>{' '}
                                                {item.email}
                                            </p>
                                            <p>
                                                <strong>Address:</strong>{' '}
                                                {item.placeAddress ?? '-'}
                                            </p>
                                        </div>

                                        <button
                                            className="account-danger-btn"
                                            onClick={() =>
                                                handleAdminDeleteCompany(
                                                    item.id,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="admin-accordion__item">
                <button
                    type="button"
                    className={`admin-accordion__header ${
                        adminOpenSections.events ? 'is-open' : ''
                    }`}
                    onClick={() => toggleAdminSection('events')}
                >
                    <span>Events</span>
                    <span className="admin-accordion__icon">
                        {adminOpenSections.events ? '−' : '+'}
                    </span>
                </button>

                {adminOpenSections.events && (
                    <div className="admin-accordion__body">
                        {adminEventsLoading ? (
                            <p className="account-muted">Loading...</p>
                        ) : adminEvents.length === 0 ? (
                            <p className="account-muted">No events found.</p>
                        ) : (
                            <div className="admin-list">
                                {adminEvents.map((item) => (
                                    <div key={item.id} className="admin-row">
                                        <div className="admin-row__info">
                                            <p>
                                                <strong>Title:</strong>{' '}
                                                {item.title}
                                            </p>
                                            <p>
                                                <strong>Category:</strong>{' '}
                                                {item.category}
                                            </p>
                                            <p>
                                                <strong>Place:</strong>{' '}
                                                {item.placeAddress ??
                                                    item.placeName}
                                            </p>
                                        </div>

                                        <button
                                            className="account-danger-btn"
                                            onClick={() =>
                                                handleAdminDeleteEvent(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="admin-accordion__item">
                <button
                    type="button"
                    className={`admin-accordion__header ${
                        adminOpenSections.comments ? 'is-open' : ''
                    }`}
                    onClick={() => toggleAdminSection('comments')}
                >
                    <span>Comments</span>
                    <span className="admin-accordion__icon">
                        {adminOpenSections.comments ? '−' : '+'}
                    </span>
                </button>

                {adminOpenSections.comments && (
                    <div className="admin-accordion__body">
                        {adminCommentsLoading ? (
                            <p className="account-muted">Loading...</p>
                        ) : adminComments.length === 0 ? (
                            <p className="account-muted">No comments found.</p>
                        ) : (
                            <div className="admin-list">
                                {adminComments.map((item) => (
                                    <div key={item.id} className="admin-row">
                                        <div className="admin-row__info">
    <p>
        <strong>Comment:</strong>{' '}
        {item.content}
    </p>

    <p>
        <strong>Event:</strong>{' '}
        {item.eventTitle ?? 'Event not found'}
    </p>

    <p>
        <strong>Author:</strong>{' '}
        {item.authorLogin ?? 'User not found'}
    </p>
</div>

                                        <button
                                            className="account-danger-btn"
                                            onClick={() =>
                                                handleAdminDeleteComment(
                                                    item.id,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
)}

                    {activeSection === 'settings' && (
                        <>
                            <div className="account-block account-scroll-item">
                                <h2 className="account-block__heading">
                                    LOGIN
                                </h2>

                                <div className="account-row">
                                    <input
                                        className={`account-input ${isEditingLogin ? 'editing' : ''}`}
                                        value={loginValue}
                                        disabled={!isEditingLogin}
                                        onChange={(e) =>
                                            setLoginValue(e.target.value)
                                        }
                                    />

                                    <input
                                        className="account-input account-input--readonly"
                                        value={user?.email ?? ''}
                                        disabled
                                    />

                                    {!isEditingLogin ? (
                                        <button
                                            className="account-action-btn"
                                            onClick={() =>
                                                setIsEditingLogin(true)
                                            }
                                        >
                                            Change
                                        </button>
                                    ) : (
                                        <button
                                            className="account-action-btn"
                                            onClick={handleSaveLogin}
                                            disabled={settingsLoading}
                                        >
                                            Save
                                        </button>
                                    )}

                                    <button
                                        className="account-danger-btn"
                                        onClick={handleDeleteAccount}
                                    >
                                        Delete Account
                                    </button>
                                </div>

                                {settingsError ? (
                                    <p className="account-error">
                                        {settingsError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="account-block account-scroll-item">
                                <h2 className="account-block__heading">
                                    COMPANY
                                </h2>

                                {companyLoading ? (
                                    <p className="account-muted">Loading...</p>
                                ) : !company ? (
                                    <button
                                        className="account-action-btn"
                                        onClick={() =>
                                            navigate('/create-company')
                                        }
                                    >
                                        Create Company
                                    </button>
                                ) : (
                                    <>
                                        <div className="company-card account-scroll-item">
                                            <div className="company-card__avatar">
                                                <img
                                                    src={
                                                        company.avatarUrl ||
                                                        companyDefaultAvatar
                                                    }
                                                    alt={company.name}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror =
                                                            null;
                                                        e.currentTarget.src =
                                                            companyDefaultAvatar;
                                                    }}
                                                />
                                            </div>

                                            <div className="company-card__fields">
                                                <input
                                                    className={`account-input company-card__name ${isEditingCompany ? 'editing' : ''}`}
                                                    value={companyForm.name}
                                                    disabled={!isEditingCompany}
                                                    onChange={(e) =>
                                                        setCompanyForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                name: e.target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                />

                                                <input
                                                    className="account-input account-input--readonly company-card__email"
                                                    value={companyForm.email}
                                                    disabled
                                                />

                                                <input
                                                    className={`account-input company-card__address ${isEditingCompany ? 'editing' : ''}`}
                                                    value={
                                                        companyForm.placeAddress
                                                    }
                                                    disabled={!isEditingCompany}
                                                    onChange={(e) =>
                                                        setCompanyForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                placeAddress:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder="Location"
                                                />

                                                <textarea
                                                    className={`account-textarea company-card__description ${isEditingCompany ? 'editing' : ''}`}
                                                    value={
                                                        companyForm.description
                                                    }
                                                    disabled={!isEditingCompany}
                                                    onChange={(e) =>
                                                        setCompanyForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder="Description"
                                                />
                                            </div>

                                            <div className="company-card__actions">
                                                {!isEditingCompany ? (
                                                    <button
                                                        className="account-action-btn"
                                                        onClick={() =>
                                                            setIsEditingCompany(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        Change
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="account-action-btn"
                                                        onClick={
                                                            handleSaveCompany
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                )}

                                                <button
                                                    className="account-danger-btn"
                                                    onClick={
                                                        handleDeleteCompany
                                                    }
                                                >
                                                    Delete Company
                                                </button>
                                            </div>
                                        </div>

                                        {companyError ? (
                                            <p className="account-error">
                                                {companyError}
                                            </p>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
