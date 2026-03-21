import { useMemo, useState } from 'react';
import type { EventItem } from '../../types/event.types';
import defaultPoster from '../../assets/home/default-poster.png';
import locationRedIcon from '../../assets/home/location-red-icon.png';
import './event-card.css';

type EventCardProps = {
    event: EventItem;
};

function formatCardDate(dateString: string) {
    const date = new Date(dateString);

    return {
        month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate(),
    };
}

function getShortPlace(
    placeAddress?: string | null,
    placeName?: string | null,
) {
    const source = placeAddress?.trim() || placeName?.trim() || '';

    if (!source) return 'Washington';

    return source.split(',')[0].trim();
}

export function EventCard({ event }: EventCardProps) {
    const [imageError, setImageError] = useState(false);

    const date = formatCardDate(event.startsAt);

    const shortPlace = useMemo(() => {
        return getShortPlace(event.placeAddress, event.placeName);
    }, [event.placeAddress, event.placeName]);

    const imageUrl =
        event.posterUrl && !imageError ? event.posterUrl : defaultPoster;

    return (
        <article className="event-card">
            <div className="event-card__image-wrap">
                <img
                    src={imageUrl}
                    alt={event.title}
                    className="event-card__image"
                    onError={() => setImageError(true)}
                />

                <div className="event-card__place-badge">
                    <span className="event-card__place-text">{shortPlace}</span>
                    <img
                        src={locationRedIcon}
                        alt="Location"
                        className="event-card__place-icon"
                    />
                </div>

                <div className="event-card__hover">
                    <div className="event-card__hover-inner">
                        <div className="event-card__date-box">
                            <span className="event-card__month">
                                {date.month}
                            </span>
                            <span className="event-card__day">{date.day}</span>
                        </div>

                        <div className="event-card__content">
                            <h3 className="event-card__title">{event.title}</h3>

                            <p className="event-card__description">
                                {event.description}
                            </p>

                            <div className="event-card__footer">
                                <span className="event-card__place">
                                    {shortPlace}
                                </span>

                                <img
                                    src={locationRedIcon}
                                    alt="Location"
                                    className="event-card__footer-icon"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
