export type PhotonFeature = {
    geometry: {
        coordinates: [number, number];
    };
    properties: {
        name?: string;
        country?: string;
        countrycode?: string;
        state?: string;
        city?: string;
        county?: string;
        street?: string;
        postcode?: string;
        osm_id?: number | string;
        osm_type?: string;
    };
};

export type PhotonResponse = {
    features: PhotonFeature[];
};

export type PlaceSuggestion = {
    id: string;
    label: string;
    placeName: string;
    placeAddress: string;
    lat: string | null;
    lng: string | null;
    country: string | null;
    countryCode: string | null;
    state: string | null;
};

type SearchPlacesOptions = {
    limit?: number;
    onlyUSA?: boolean;
};

function buildAddress(properties: PhotonFeature['properties']) {
    const parts = [
        properties.name,
        properties.city,
        properties.state,
        properties.country,
    ].filter(Boolean);

    return parts.join(', ');
}

export async function searchPlaces(
    query: string,
    options?: SearchPlacesOptions,
): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();

    if (!trimmed) return [];

    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('limit', String(options?.limit ?? 6));

    const response = await fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch place suggestions');
    }

    const data = (await response.json()) as PhotonResponse;

    const mapped = data.features
        .map((feature) => {
            const properties = feature.properties;
            const [lng, lat] = feature.geometry.coordinates;

            const placeName =
                properties.city ||
                properties.state ||
                properties.name ||
                'Unknown place';

            const placeAddress = buildAddress(properties);

            return {
                id: `${properties.osm_type || 'osm'}-${properties.osm_id || placeAddress}`,
                label: placeAddress || placeName,
                placeName,
                placeAddress: placeAddress || placeName,
                lat: lat != null ? String(lat) : null,
                lng: lng != null ? String(lng) : null,
                country: properties.country || null,
                countryCode: properties.countrycode || null,
                state: properties.state || null,
            } satisfies PlaceSuggestion;
        })
        .filter((item) => item.label);

    if (options?.onlyUSA) {
        return mapped.filter((item) => {
            const code = item.countryCode?.toLowerCase();
            const country = item.country?.toLowerCase();

            return code === 'us' || country === 'united states';
        });
    }

    return mapped;
}
