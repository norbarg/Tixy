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

export interface CreateCompanyPayload {
    name: string;
    email: string;
    description?: string;
    avatarUrl?: string;
    placeAddress?: string;
}

export interface UpdateCompanyPayload {
    name?: string;
    email?: string;
    description?: string;
    avatarUrl?: string;
    placeAddress?: string;
}
