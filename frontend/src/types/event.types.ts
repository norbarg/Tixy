//src/types/event.types.ts

export type EventCategory =
    | 'business'
    | 'politics'
    | 'psychology'
    | 'music'
    | 'entertainment'
    | 'film'
    | 'technology'
    | 'design'
    | 'education'
    | 'health'
    | 'sports';

export type EventFormat =
    | 'CONFERENCE'
    | 'LECTURE'
    | 'WORKSHOP'
    | 'CONCERT'
    | 'FEST';

export interface EventItem {
    id: string;
    companyId: string;
    title: string;
    description: string;
    format: EventFormat;
    category: EventCategory;
    bannerUrl: string | null;
    posterUrl: string | null;
    placeName: string;
    placeAddress: string | null;
    googleMapsUrl: string | null;
    googlePlaceId: string | null;
    placeLat: string | number | null;
    placeLng: string | number | null;
    startsAt: string;
    endsAt: string;
    publishedAt: string;
    redirectAfterPurchaseUrl: string | null;
    price: string;
    ticketsLimit: number;
    visitorsVisibility: string;
    notifyOnNewVisitor?: boolean;
    availableTickets?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
