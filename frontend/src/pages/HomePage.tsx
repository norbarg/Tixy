//src/pages/HomePage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { eventsApi } from '../api/events.api';
import { companiesApi } from '../api/companies.api';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import type {
    EventCategory,
    EventFormat,
    EventItem,
} from '../types/event.types';
import type { Company } from '../types/company.types';
import { EventCard } from '../components/home/EventCard';
import { Footer } from '../components/layout/Footer';
import { searchPlaces, type PlaceSuggestion } from '../lib/photon';

import defaultBanner from '../assets/home/default-banner.png';
import searchIcon from '../assets/home/search-icon.png';
import arrowIcon from '../assets/home/arrow-icon.png';
import ctaLeftCharacter from '../assets/home/cta-left-character.png';
import ctaCenterCharacter from '../assets/home/cta-center-character.png';
import ctaRightCharacter from '../assets/home/cta-right-character.png';
import ctaFourthCharacter from '../assets/home/cta-fourth-character.png';
import defaultCompanyAvatar from '../assets/home/default-company-avatar.png';
import companiesArrowLeft from '../assets/home/arrow-red-icon.png';
import companiesArrowRight from '../assets/home/arrow-red-icon.png';
import './home-page.css';

const formatOptions: { value: '' | EventFormat; label: string }[] = [
    { value: '', label: 'All formats' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'LECTURE', label: 'Lecture' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'CONCERT', label: 'Concert' },
    { value: 'FEST', label: 'Fest' },
];

const categoryOptions: { value: '' | EventCategory; label: string }[] = [
    { value: '', label: 'Themes' },
    { value: 'business', label: 'Business' },
    { value: 'politics', label: 'Politics' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'music', label: 'Music' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'film', label: 'Film' },
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'sports', label: 'Sports' },
];

function formatDateLabel(date: string) {
    if (!date) return 'Any date';

    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function HomePage() {

    const { isAuthenticated } = useAuth();
    const [hasCompany, setHasCompany] = useState(false);
    const [isCheckingCompany, setIsCheckingCompany] = useState(false);


    const [events, setEvents] = useState<EventItem[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [place, setPlace] = useState('');
    const [date, setDate] = useState('');
    const [format, setFormat] = useState<'' | EventFormat>('');
    const [category, setCategory] = useState<'' | EventCategory>('');
    const [visibleCount, setVisibleCount] = useState(6);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [bannerImageError, setBannerImageError] = useState(false);

    const [placeInput, setPlaceInput] = useState('');
    const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>(
        [],
    );
    const [isPlaceOpen, setIsPlaceOpen] = useState(false);
    const [isPlaceLoading, setIsPlaceLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(
        null,
    );

    const placeRef = useRef<HTMLDivElement | null>(null);

    const dateInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setSearch(searchInput.trim());
        }, 600);

        return () => window.clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        const trimmed = placeInput.trim();

        if (!trimmed) {
            setPlaceSuggestions([]);
            setIsPlaceOpen(false);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setIsPlaceLoading(true);
                const suggestions = await searchPlaces(trimmed);
                setPlaceSuggestions(suggestions);
                setIsPlaceOpen(true);
            } catch (error) {
                console.error('Failed to load place suggestions', error);
                setPlaceSuggestions([]);
                setIsPlaceOpen(false);
            } finally {
                setIsPlaceLoading(false);
            }
        }, 450);

        return () => window.clearTimeout(timeoutId);
    }, [placeInput]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                placeRef.current &&
                !placeRef.current.contains(event.target as Node)
            ) {
                setIsPlaceOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);

                const [eventsData, companiesData] = await Promise.all([
                    eventsApi.getAll({
                        search: search || undefined,
                        place: place || undefined,
                        date: date || undefined,
                        format: format || undefined,
                        category: category || undefined,
                    }),
                    companiesApi.getAll(),
                ]);

                setEvents(eventsData);
                setCompanies(companiesData);
                setVisibleCount(6);
                setCurrentBannerIndex(0);
                setBannerImageError(false);
            } catch (error) {
                console.error('Failed to load homepage data', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [search, place, date, format, category]);

    const bannerEvents = useMemo(() => {
        return events.filter((event) => Boolean(event.bannerUrl));
    }, [events]);

    const visibleEvents = useMemo(() => {
        return events.slice(0, visibleCount);
    }, [events, visibleCount]);

    const marqueeCompanies = useMemo(() => {
    if (companies.length === 0) return [];
    return [...companies, ...companies];
}, [companies]);

    useEffect(() => {
        if (bannerEvents.length <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % bannerEvents.length);
            setBannerImageError(false);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [bannerEvents]);

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

    const currentBanner = bannerEvents[currentBannerIndex] || null;
    const canLoadMore = visibleCount < events.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };
    const handleSearchKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            setSearch(searchInput.trim());
        }
    };

    const openDatePicker = () => {
        if (!dateInputRef.current) return;

        const input = dateInputRef.current as HTMLInputElement & {
            showPicker?: () => void;
        };

        if (typeof input.showPicker === 'function') {
            input.showPicker();
            return;
        }

        input.focus();
        input.click();
    };

    const bannerImageSrc =
        currentBanner?.bannerUrl && !bannerImageError
            ? currentBanner.bannerUrl
            : defaultBanner;

    return (
        <>
            <main className="home-page">
                <section className="home-hero">
                    <div className="home-hero__banner">
                        <img
                            src={bannerImageSrc}
                            alt={currentBanner?.title || 'Default banner'}
                            className="home-hero__image"
                            onError={() => setBannerImageError(true)}
                        />

                        <div className="home-search">
                            <div className="home-search__item home-search__item--search">
                                <label className="home-search__label">
                                    Search Event/Company
                                </label>

                                <div className="home-search__control">
                                    <input
                                        type="text"
                                        className="home-search__input"
                                        placeholder="Search"
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                        onKeyDown={handleSearchKeyDown}
                                    />

                                    <button
                                        type="button"
                                        className="home-search__icon-btn"
                                        onClick={() =>
                                            setSearch(searchInput.trim())
                                        }
                                    >
                                        <img
                                            src={searchIcon}
                                            alt="Search"
                                            className="home-search__icon-image"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="home-search__item" ref={placeRef}>
                                <label className="home-search__label">
                                    Place
                                </label>

                                <div className="home-search__control">
                                    <input
                                        type="text"
                                        className="home-search__input home-search__input--plain"
                                        placeholder="Any places"
                                        value={placeInput}
                                        onChange={(e) => {
                                            setPlaceInput(e.target.value);
                                            setSelectedPlace(null);
                                        }}
                                        onFocus={() => {
                                            if (placeSuggestions.length > 0) {
                                                setIsPlaceOpen(true);
                                            }
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                setPlace(placeInput.trim());
                                                setIsPlaceOpen(false);
                                            }
                                        }}
                                    />
                                </div>

                                {isPlaceOpen && (
                                    <div className="home-search__suggestions">
                                        {isPlaceLoading ? (
                                            <div className="home-search__suggestion home-search__suggestion--muted">
                                                Loading...
                                            </div>
                                        ) : placeSuggestions.length > 0 ? (
                                            placeSuggestions.map(
                                                (suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        className="home-search__suggestion"
                                                        onClick={() => {
                                                            setSelectedPlace(
                                                                suggestion,
                                                            );
                                                            setPlaceInput(
                                                                suggestion.placeAddress,
                                                            );
                                                            setPlace(
                                                                suggestion.placeAddress,
                                                            );
                                                            setIsPlaceOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {suggestion.label}
                                                    </button>
                                                ),
                                            )
                                        ) : (
                                            <div className="home-search__suggestion home-search__suggestion--muted">
                                                No places found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="home-search__item">
                                <label className="home-search__label">
                                    Time
                                </label>

                                <button
                                    type="button"
                                    className="home-search__date-trigger"
                                    onClick={openDatePicker}
                                >
                                    <span className="home-search__date-value">
                                        {formatDateLabel(date)}
                                    </span>

                                    <img
                                        src={arrowIcon}
                                        alt="arrow"
                                        className="home-search__date-arrow-image"
                                    />
                                </button>

                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    className="home-search__date-native"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-section">
                    <div className="home-section__header">
                        <h2 className="home-section__title">Upcoming Events</h2>

                        <div className="home-section__filters">
                            <div className="home-section__select-wrap">
                                <select
                                    className="home-section__select"
                                    value={format}
                                    onChange={(e) =>
                                        setFormat(
                                            e.target.value as '' | EventFormat,
                                        )
                                    }
                                >
                                    {formatOptions.map((option) => (
                                        <option
                                            key={option.value || 'all-formats'}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="home-section__select-wrap">
                                <select
                                    className="home-section__select"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(
                                            e.target.value as
                                                | ''
                                                | EventCategory,
                                        )
                                    }
                                >
                                    {categoryOptions.map((option) => (
                                        <option
                                            key={
                                                option.value || 'all-categories'
                                            }
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="home-page__state">
                            Loading events...
                        </div>
                    ) : visibleEvents.length > 0 ? (
                        <>
                            <div className="events-grid">
                                {visibleEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>

                            {canLoadMore && (
                                <div className="home-page__center">
                                    <button
                                        type="button"
                                        className="home-page__load-more"
                                        onClick={handleLoadMore}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="home-page__state">
                            No events found for selected filters.
                        </div>
                    )}
                </section>

                <section className="home-cta">
                    <div className="home-cta__scene">
                        <img
                            src={ctaLeftCharacter}
                            alt=""
                            className="home-cta__character home-cta__character--left"
                        />

                        <img
    src={ctaFourthCharacter}
    alt=""
    className="home-cta__character home-cta__character--fourth"
/>


                        <img
                            src={ctaCenterCharacter}
                            alt=""
                            className="home-cta__character home-cta__character--center"
                        />

                        <img
                            src={ctaRightCharacter}
                            alt=""
                            className="home-cta__character home-cta__character--right"
                        />

                        <div className="home-cta__bar">
                            <div className="home-cta__content">
                                <div className="home-cta__copy">
                                    <h3 className="home-cta__title">
                                        Make your own Event
                                    </h3>

                                    <p className="home-cta__text">
                                        Create and share unforgettable
                                        experiences in just a few clicks. Set up
                                        your event, and let people discover what
                                        makes it special — all in one place.
                                    </p>
                                </div>
{!isAuthenticated ? (
    <button
        type="button"
        className="home-cta__button"
    >
        Create
    </button>
) : (
    !isCheckingCompany && (
        <Link
            to={hasCompany ? '/create-event' : '/create-company'}
            className="home-cta__button"
        >
            Create
        </Link>
    )
)}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-section">
                    <h2 className="home-section__title">Companies</h2>

                    {companies.length > 0 ? (
                        <div className="companies-slider">
    <button
        type="button"
        className="companies-slider__arrow companies-slider__arrow--left"
        aria-label="Previous companies"
    >
        <img
            src={companiesArrowLeft}
            alt="Previous"
            className="companies-slider__arrow-icon"
        />
    </button>

    <div className="companies-slider__viewport">
        <div className="companies-slider__track">
            {marqueeCompanies.map((company, index) => (
                <div
                    key={`${company.id}-${index}`}
                    className="companies-slider__item"
                >
                    <div className="companies-slider__avatar">
                        <img
                            src={company.avatarUrl || defaultCompanyAvatar}
                            alt={company.name}
                            className="companies-slider__avatar-image"
                            onError={(e) => {
                                e.currentTarget.src = defaultCompanyAvatar;
                            }}
                        />
                    </div>

                    <span className="companies-slider__name">
                        {company.name}
                    </span>
                </div>
            ))}
        </div>
    </div>

    <button
        type="button"
        className="companies-slider__arrow companies-slider__arrow--right"
        aria-label="Next companies"
    >
        <img
            src={companiesArrowRight}
            alt="Next"
            className="companies-slider__arrow-icon"
        />
    </button>
</div>
                    ) : (
                        <div className="home-page__state">
                            No companies yet.
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}
