export interface Company {
    id: string;
    ownerUserId: string;
    name: string;
    description: string | null;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    placeAddress: string | null;
    googleMapsUrl: string | null;
    googlePlaceId: string | null;
    placeLat: string | null;
    placeLng: string | null;
}
