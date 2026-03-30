//src/pages/EventDetailsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventsApi } from '../api/events.api';
import { companiesApi } from '../api/companies.api';
import { commentsApi } from '../api/comments.api';
import { attendeesApi } from '../api/attendees.api';
import { subscriptionsApi } from '../api/subscriptions.api';
import { ordersApi } from '../api/orders.api';
import { paymentsApi } from '../api/payments.api';
import { EventMap } from '../components/maps/EventMap';
import { EventCard } from '../components/home/EventCard';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { EventItem } from '../types/event.types';
import type { Company } from '../types/company.types';
import type { CommentItem } from '../types/comment.types';
import type { EventAttendeeItem } from '../api/attendees.api';
import defaultBanner from '../assets/home/default-banner.png';
import locationRedIcon from '../assets/home/location-red-icon.png';
import dateRedIcon from '../assets/home/date-red-icon.png';
import Arrow2 from '../assets/home/arrow-red-icon.png';
import deleteRedIcon from '../assets/home/delete-red-icon.png';
import defaultCompanyAvatar from '../assets/home/default-company-avatar.png';
import bellIcon from '../assets/home/bell-icon.png';
import './event-details-page.css';

function formatCommentDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function formatEventDateRange(startsAt: string, endsAt: string) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    const startText = start.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    const endText = end.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    return `${startText} - ${endText}`;
}

function getShortPlace(
    placeAddress?: string | null,
    placeName?: string | null,
) {
    const source = placeAddress?.trim() || placeName?.trim() || '';
    if (!source) return 'Washington';
    return source;
}

export function EventDetailsPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [attendees, setAttendees] = useState<EventAttendeeItem[]>([]);
    const [allEvents, setAllEvents] = useState<EventItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [commentText, setCommentText] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showInVisitors, setShowInVisitors] = useState(true);

    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const [isEventSubscribed, setIsEventSubscribed] = useState(false);
    const [isCompanySubscribed, setIsCompanySubscribed] = useState(false);

    const [error, setError] = useState('');

    const [bannerImageError, setBannerImageError] = useState(false);
    const [companyAvatarError, setCompanyAvatarError] = useState(false);

    const { setCartItem, clearCart } = useCart();

    const [visibleCompanyEventsCount, setVisibleCompanyEventsCount] =
        useState(3);
    const [visibleSimilarEventsCount, setVisibleSimilarEventsCount] =
        useState(3);

    const [attendeesForbidden, setAttendeesForbidden] = useState(false);
    const maxAvailableTickets =
        event?.availableTickets ?? event?.ticketsLimit ?? 0;
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                setIsLoading(true);
                setError('');

                const eventData = await eventsApi.getById(id);
                setEvent(eventData);

                const [companyData, commentsData, eventsData] =
                    await Promise.all([
                        companiesApi.getById(eventData.companyId),
                        commentsApi.getByEventId(eventData.id),
                        eventsApi.getAll(),
                    ]);

                setCompany(companyData);
                setComments(commentsData);
                setAllEvents(eventsData);

                try {
                    const attendeesData = await attendeesApi.getByEventId(
                        eventData.id,
                    );
                    setAttendees(attendeesData);
                    setAttendeesForbidden(false);
                } catch (attendeesError: any) {
                    if (attendeesError?.response?.status === 403) {
                        setAttendees([]);
                        setAttendeesForbidden(true);
                    } else {
                        throw attendeesError;
                    }
                }

                if (isAuthenticated) {
                    try {
                        const subscriptions =
                            await subscriptionsApi.getMySubscriptions();

                        setIsEventSubscribed(
                            subscriptions.events.some(
                                (item) => item.eventId === eventData.id,
                            ),
                        );

                        setIsCompanySubscribed(
                            subscriptions.companies.some(
                                (item) =>
                                    item.companyId === eventData.companyId,
                            ),
                        );
                    } catch (subError) {
                        console.error('Failed to load subscriptions', subError);
                    }
                }
            } catch (loadError) {
                console.error(loadError);
                setError('Failed to load event page');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id, isAuthenticated]);

    useEffect(() => {
        if (!event) {
            clearCart();
            return;
        }

        setCartItem({
            eventId: event.id,
            title: event.title,
            unitPrice: Number(event.price || 0),
            quantity,
        });
    }, [event, quantity, setCartItem, clearCart]);

    useEffect(() => {
        return () => {
            clearCart();
        };
    }, [clearCart]);

    useEffect(() => {
        setBannerImageError(false);
    }, [event?.id]);
    useEffect(() => {
        setCompanyAvatarError(false);
    }, [company?.id]);

    useEffect(() => {
        setVisibleCompanyEventsCount(3);
        setVisibleSimilarEventsCount(3);
    }, [event?.id]);

    const companyEventsAll = useMemo(() => {
        if (!event) return [];
        return allEvents.filter(
            (item) =>
                item.companyId === event.companyId && item.id !== event.id,
        );
    }, [allEvents, event]);

    const similarEventsAll = useMemo(() => {
        if (!event) return [];
        return allEvents.filter(
            (item) => item.category === event.category && item.id !== event.id,
        );
    }, [allEvents, event]);
    const companyEvents = useMemo(() => {
        return companyEventsAll.slice(0, visibleCompanyEventsCount);
    }, [companyEventsAll, visibleCompanyEventsCount]);

    const similarEvents = useMemo(() => {
        return similarEventsAll.slice(0, visibleSimilarEventsCount);
    }, [similarEventsAll, visibleSimilarEventsCount]);

    const hasMoreCompanyEvents =
        companyEventsAll.length > visibleCompanyEventsCount;

    const hasMoreSimilarEvents =
        similarEventsAll.length > visibleSimilarEventsCount;

    const subtotal = useMemo(() => {
        if (!event) return 0;
        const unitPrice = Number(event.price || 0);
        return unitPrice * quantity;
    }, [event, quantity]);
    function handleLoadMoreCompanyEvents() {
        setVisibleCompanyEventsCount((prev) => prev + 3);
    }

    function handleLoadMoreSimilarEvents() {
        setVisibleSimilarEventsCount((prev) => prev + 3);
    }
    async function handleCreateComment() {
        if (!event || !commentText.trim()) return;

        try {
            setIsSubmittingComment(true);

            const created = await commentsApi.createComment({
                eventId: event.id,
                content: commentText.trim(),
            });

            setComments((prev) => [created, ...prev]);
            setCommentText('');
        } catch (commentError) {
            console.error(commentError);
            setError('Failed to create comment');
        } finally {
            setIsSubmittingComment(false);
        }
    }

    async function handleDeleteComment(commentId: string) {
        try {
            await commentsApi.deleteComment(commentId);
            setComments((prev) => prev.filter((item) => item.id !== commentId));
        } catch (commentError) {
            console.error(commentError);
            setError('Failed to delete comment');
        }
    }

    async function handleToggleEventSubscription() {
        if (!event) return;

        try {
            if (isEventSubscribed) {
                await subscriptionsApi.unsubscribeFromEvent(event.id);
                setIsEventSubscribed(false);
            } else {
                await subscriptionsApi.subscribeToEvent(event.id);
                setIsEventSubscribed(true);
            }
        } catch (subError) {
            console.error(subError);
            setError('Failed to update event subscription');
        }
    }

    async function handleToggleCompanySubscription() {
        if (!company) return;

        try {
            if (isCompanySubscribed) {
                await subscriptionsApi.unsubscribeFromCompany(company.id);
                setIsCompanySubscribed(false);
            } else {
                await subscriptionsApi.subscribeToCompany(company.id);
                setIsCompanySubscribed(true);
            }
        } catch (subError) {
            console.error(subError);
            setError('Failed to update company subscription');
        }
    }

    async function handleBuyNow() {
        if (!event) return;

        try {
            setIsBuying(true);

            const order = await ordersApi.createOrder({
                eventId: event.id,
                quantity,
                promoCode: promoCode.trim() || undefined,
                showUserInVisitors: showInVisitors,
            });

            const checkout = await paymentsApi.createCheckout(order.id);
            window.location.href = checkout.checkoutUrl;
        } catch (buyError) {
            console.error(buyError);
            setError('Failed to start checkout');
        } finally {
            setIsBuying(false);
        }
    }

    if (isLoading) {
        return <main className="event-details-page">Loading event...</main>;
    }

    if (!event) {
        return <main className="event-details-page">Event not found</main>;
    }

    const bannerSrc =
        event.bannerUrl && !bannerImageError ? event.bannerUrl : defaultBanner;
    const placeLabel = getShortPlace(event.placeAddress, event.placeName);
    const lat = event.placeLat ? Number(event.placeLat) : null;
    const lng = event.placeLng ? Number(event.placeLng) : null;

    const companyAvatarSrc =
        company?.avatarUrl && !companyAvatarError
            ? company.avatarUrl
            : defaultCompanyAvatar;

    return (
        <>
            <main className="event-details-page">
                <section className="event-details-hero">
                    <img
                        src={bannerSrc}
                        alt={event.title}
                        className="event-details-hero__image"
                        onError={() => setBannerImageError(true)}
                    />
                </section>

                <section className="event-details-section">
                    <div className="event-details-head">
                        <div className="event-details-head__inner">
                            <h1 className="event-details-head__title">
                                {event.title}
                            </h1>
                            <button
                                type="button"
                                className="event-details-follow"
                                onClick={handleToggleEventSubscription}
                                disabled={!isAuthenticated}
                            >
                                {isEventSubscribed ? 'Following' : 'Follow'}
                            </button>
                        </div>
                        <p className="event-details-head__description">
                            {event.description}
                        </p>

                        <div className="event-details-meta">
                            <div className="event-details-meta__row">
                                <img
                                    src={dateRedIcon}
                                    alt=""
                                    className="event-details-meta__date-icon"
                                />
                                <span>
                                    {formatEventDateRange(
                                        event.startsAt,
                                        event.endsAt,
                                    )}
                                </span>
                            </div>

                            <div className="event-details-meta__row">
                                <img
                                    src={locationRedIcon}
                                    alt=""
                                    className="event-details-meta__location-icon"
                                />
                                <span>{placeLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="event-details-main">
                        <div className="event-details-map-wrap">
                            {lat != null && lng != null ? (
                                <EventMap
                                    lat={lat}
                                    lng={lng}
                                    title={event.title}
                                />
                            ) : (
                                <div className="event-details-map-placeholder">
                                    Map unavailable
                                </div>
                            )}
                        </div>

                        <div className="event-purchase-card">
                            <div className="event-purchase-card__subtotal-label">
                                SUBTOTAL
                            </div>
                            <div className="event-purchase-card__subtotal">
                                ${subtotal.toFixed(2)}
                            </div>

                            <div className="event-purchase-card__quantity">
                                <span>quantity</span>
                                <div className="event-purchase-card__quantity-controls">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                Math.max(1, prev - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>

                                    <span>{quantity}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                Math.min(
                                                    maxAvailableTickets,
                                                    prev + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            quantity >= maxAvailableTickets ||
                                            maxAvailableTickets <= 0
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <label className="event-purchase-card__promo">
                                <span className="event-purchase-card__promo-label">
                                    PROMO CODE
                                </span>

                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) =>
                                        setPromoCode(e.target.value)
                                    }
                                    placeholder="Add"
                                    className="event-purchase-card__promo-input"
                                />
                            </label>

                            <label className="event-purchase-card__checkbox">
                                <span className="event-purchase-card__checkbox-text">
                                    Appear in the participants list
                                </span>

                                <span className="event-purchase-card__checkbox-box">
                                    <input
                                        className="event-purchase-card__checkbox-input"
                                        type="checkbox"
                                        checked={showInVisitors}
                                        onChange={(e) =>
                                            setShowInVisitors(e.target.checked)
                                        }
                                    />
                                    <span className="event-purchase-card__checkbox-custom" />
                                </span>
                            </label>

                            {maxAvailableTickets <= 0 ? (
                                <div className="event-purchase-card__button event-purchase-card__button--soldout">
                                    <span>SOLD OUT</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="event-purchase-card__button"
                                    onClick={handleBuyNow}
                                    disabled={!isAuthenticated || isBuying}
                                >
                                    <span>
                                        {isBuying ? 'Loading...' : 'Buy Now'}
                                    </span>
                                    <img
                                        src={Arrow2}
                                        alt=""
                                        className="event-purchase-card__button-icon"
                                    />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="event-details-divider" />

                    <section className="event-details-block">
                        <h2 className="event-details-block__title">
                            List of participants
                        </h2>

                        {attendees.length > 0 ? (
                            <div className="event-details-participants">
                                {attendees.map((item) => (
                                    <span key={item.id}>
                                        @{item.user?.login || 'user'}
                                    </span>
                                ))}
                            </div>
                        ) : attendeesForbidden ? (
                            <p className="event-details-empty">
                                Participants list is available only for ticket
                                holders.
                            </p>
                        ) : (
                            <p className="event-details-empty">
                                No visible participants yet.
                            </p>
                        )}
                    </section>

                    <section className="event-details-block">
                        <h2 className="event-details-block__title">Comments</h2>

                        {isAuthenticated ? (
                            <div className="event-details-comment-form">
                                <textarea
                                    value={commentText}
                                    onChange={(e) =>
                                        setCommentText(e.target.value)
                                    }
                                    placeholder="Add comment..."
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateComment}
                                    disabled={
                                        isSubmittingComment ||
                                        !commentText.trim()
                                    }
                                >
                                    {isSubmittingComment
                                        ? 'Sending...'
                                        : 'Publish'}
                                </button>
                            </div>
                        ) : (
                            <p className="event-details-empty">
                                Log in to leave a comment.
                            </p>
                        )}

                        <div className="event-details-comments-list">
                            {comments.length > 0 ? (
                                comments.map((comment) => {
                                    const canDelete =
                                        user &&
                                        (user.id === comment.authorUserId ||
                                            user.role === 'ADMIN');

                                    return (
                                        <div
                                            key={comment.id}
                                            className="event-details-comment"
                                        >
                                            <div className="event-details-comment__top">
                                                <span>
                                                    @
                                                    {comment.authorUserId.slice(
                                                        0,
                                                        8,
                                                    )}
                                                </span>
                                                <span>
                                                    {formatCommentDate(
                                                        comment.createdAt,
                                                    )}
                                                </span>

                                                {canDelete ? (
                                                    <button
                                                        type="button"
                                                        className="event-details-comment__delete"
                                                        onClick={() =>
                                                            handleDeleteComment(
                                                                comment.id,
                                                            )
                                                        }
                                                        aria-label="Delete comment"
                                                    >
                                                        <img
                                                            src={deleteRedIcon}
                                                            alt=""
                                                            className="event-details-comment__delete-icon"
                                                        />
                                                    </button>
                                                ) : null}
                                            </div>
                                            <p className="event-details-participants">
                                                {comment.content}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="event-details-empty">
                                    No comments yet.
                                </p>
                            )}
                        </div>
                    </section>

                    <div className="event-details-divider" />

                    {company ? (
                        <section className="event-details-company">
                            <div className="event-details-company__head">
                                <div className="event-details-company__main">
                                    <div className="event-details-company__brand">
                                        <div className="event-details-company__avatar">
                                            <img
                                                src={companyAvatarSrc}
                                                alt={company.name}
                                                className="event-details-company__avatar-image"
                                                onError={() =>
                                                    setCompanyAvatarError(true)
                                                }
                                            />
                                        </div>

                                        <div className="event-details-company__brand-info">
                                            <div className="event-details-company__brand-top">
                                                <h2 className="event-details-company__title">
                                                    {company.name}
                                                </h2>

                                                <button
                                                    type="button"
                                                    className="event-details-follow event-details-follow--company"
                                                    onClick={
                                                        handleToggleCompanySubscription
                                                    }
                                                    disabled={!isAuthenticated}
                                                >
                                                    <span>
                                                        {isCompanySubscribed
                                                            ? 'Following'
                                                            : 'Follow'}
                                                    </span>
                                                    <img
                                                        src={bellIcon}
                                                        alt=""
                                                        className="event-details-follow__icon"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="event-details-company__location">
                                        <img
                                            src={locationRedIcon}
                                            alt=""
                                            className="event-details-company__location-icon"
                                        />
                                        <span>
                                            {company.placeAddress ||
                                                'Washington'}
                                        </span>
                                    </div>
                                </div>

                                <p className="event-details-company__description">
                                    {company.description ||
                                        'No company description yet.'}
                                </p>
                            </div>
                        </section>
                    ) : null}

                    <section className="event-details-cards-section">
                        <h2 className="event-details-block__title event">
                            Events from this company
                        </h2>

                        {companyEvents.length > 0 ? (
                            <>
                                <div className="event-details-cards-grid">
                                    {companyEvents.map((item) => (
                                        <EventCard key={item.id} event={item} />
                                    ))}
                                </div>
                                {hasMoreCompanyEvents ? (
                                    <div className="event-details-load-more-wrap">
                                        <button
                                            type="button"
                                            className="event-details-load-more"
                                            onClick={
                                                handleLoadMoreCompanyEvents
                                            }
                                        >
                                            Load More
                                        </button>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <p className="event-details-empty">
                                No other events from this company.
                            </p>
                        )}
                    </section>

                    <div className="event-details-divider" />

                    <section className="event-details-cards-section">
                        <h2 className="event-details-block__title event">
                            Similar events
                        </h2>

                        {similarEvents.length > 0 ? (
                            <>
                                <div className="event-details-cards-grid">
                                    {similarEvents.map((item) => (
                                        <EventCard key={item.id} event={item} />
                                    ))}
                                </div>
                                {hasMoreSimilarEvents ? (
                                    <div className="event-details-load-more-wrap">
                                        <button
                                            type="button"
                                            className="event-details-load-more"
                                            onClick={
                                                handleLoadMoreSimilarEvents
                                            }
                                        >
                                            Load More
                                        </button>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <p className="event-details-empty">
                                No similar events found.
                            </p>
                        )}
                    </section>

                    {error ? (
                        <p className="event-details-error">{error}</p>
                    ) : null}
                </section>
            </main>

            <Footer />
        </>
    );
}
