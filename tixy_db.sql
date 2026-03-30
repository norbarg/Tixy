--
-- PostgreSQL database dump
--

\restrict JkfmO3u4aGLB8idZZfapcddx9rpWvlFsKb89TsnNOdELhyiAqSnDnIf3r8gkSOU

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-30 17:05:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16393)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 924 (class 1247 OID 16753)
-- Name: events_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_category_enum AS ENUM (
    'business',
    'politics',
    'psychology',
    'music',
    'entertainment',
    'film',
    'technology',
    'design',
    'education',
    'health',
    'sports'
);


ALTER TYPE public.events_category_enum OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 16461)
-- Name: events_format_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_format_enum AS ENUM (
    'CONFERENCE',
    'LECTURE',
    'WORKSHOP',
    'CONCERT',
    'FEST'
);


ALTER TYPE public.events_format_enum OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 16778)
-- Name: events_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_status_enum AS ENUM (
    'PUBLISHED',
    'SOLD_OUT',
    'FINISHED'
);


ALTER TYPE public.events_status_enum OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 16472)
-- Name: events_visitors_visibility_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_visitors_visibility_enum AS ENUM (
    'PUBLIC',
    'ATTENDEES_ONLY'
);


ALTER TYPE public.events_visitors_visibility_enum OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 16548)
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'EVENT_REMINDER',
    'NEW_EVENT',
    'NEW_EVENT_VISITOR',
    'COMPANY_NEWS'
);


ALTER TYPE public.notifications_type_enum OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 16579)
-- Name: orders_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_payment_status_enum AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public.orders_payment_status_enum OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 16405)
-- Name: users_auth_provider_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_auth_provider_enum AS ENUM (
    'LOCAL',
    'GOOGLE',
    'LOCAL_GOOGLE'
);


ALTER TYPE public.users_auth_provider_enum OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 16412)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16653)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    author_user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16442)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    owner_user_id uuid NOT NULL,
    name character varying NOT NULL,
    description text,
    email character varying NOT NULL,
    avatar_url character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    place_address character varying,
    google_maps_url character varying,
    google_place_id character varying,
    place_lat numeric(10,7),
    place_lng numeric(10,7)
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16639)
-- Name: company_news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_news (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_news OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16611)
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_attendees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    quantity integer NOT NULL,
    show_in_visitors boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_attendees OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16626)
-- Name: event_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_subscriptions OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16489)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    format public.events_format_enum NOT NULL,
    banner_url character varying,
    poster_url character varying,
    place_name character varying NOT NULL,
    place_address character varying,
    google_maps_url character varying,
    starts_at timestamp without time zone NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    published_at timestamp without time zone NOT NULL,
    price numeric(10,2) NOT NULL,
    tickets_limit integer NOT NULL,
    visitors_visibility public.events_visitors_visibility_enum DEFAULT 'PUBLIC'::public.events_visitors_visibility_enum NOT NULL,
    notify_on_new_visitor boolean DEFAULT false NOT NULL,
    status public.events_status_enum DEFAULT 'PUBLISHED'::public.events_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    category public.events_category_enum NOT NULL,
    google_place_id character varying,
    place_lat numeric(10,7),
    place_lng numeric(10,7),
    redirect_after_purchase_url character varying(2048)
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16557)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type public.notifications_type_enum NOT NULL,
    title character varying NOT NULL,
    body text NOT NULL,
    sent_via_email boolean DEFAULT false NOT NULL,
    sent_via_site boolean DEFAULT true NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16587)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid NOT NULL,
    promo_code_id uuid,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount_percent integer DEFAULT 0 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    show_user_in_visitors boolean DEFAULT true NOT NULL,
    stripe_checkout_session_id character varying,
    stripe_payment_intent_id character varying,
    payment_status public.orders_payment_status_enum DEFAULT 'PENDING'::public.orders_payment_status_enum NOT NULL,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16534)
-- Name: organizer_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizer_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizer_subscriptions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16518)
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    code character varying NOT NULL,
    discount_percent integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.promo_codes OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16417)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    login character varying NOT NULL,
    password_hash character varying,
    auth_provider public.users_auth_provider_enum DEFAULT 'LOCAL'::public.users_auth_provider_enum NOT NULL,
    google_id character varying,
    role public.users_role_enum DEFAULT 'USER'::public.users_role_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5077 (class 0 OID 16653)
-- Dependencies: 230
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, event_id, author_user_id, content, created_at) FROM stdin;
\.


--
-- TOC entry 5068 (class 0 OID 16442)
-- Dependencies: 221
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, owner_user_id, name, description, email, avatar_url, created_at, updated_at, place_address, google_maps_url, google_place_id, place_lat, place_lng) FROM stdin;
636ac85c-8f92-40d6-9cfc-ce9b7256d08c	d9bdee13-e4ca-4a35-a63c-0137603a77cd	Spotify	Spotify is a global audio streaming company that gives users access to millions of songs, podcasts, and audiobooks from creators around the world. The platform is known for its personalized recommendations, curated playlists, and easy-to-use interface. Spotify connects artists and listeners by making audio content available anytime and anywhere. It has become one of the most popular streaming services in the world.	koliasleshev@gmail.com	http://localhost:5001/uploads/companies/avatars/spotify-logo-spotify-symbol-3-1-1774865749755.png	2026-03-30 10:16:53.77869	2026-03-30 10:16:53.77869	New York, New York, United States	\N	\N	40.7127281	-74.0060152
4a8b2228-45fa-4310-8189-401cd618eab5	25f96af5-df82-4194-aeb2-87abe695acca	Golden Stage Entertainment	Golden Stage Entertainment is a creative event company specializing in live concerts, music showcases, and unforgettable audience experiences. The company focuses on high-quality production, unique artistic concepts, and well-organized performances across major cities. Its mission is to connect fans with the energy of live music through memorable events and exceptional atmosphere.	Mykola.Svishchev@cs.khpi.edu.ua	http://localhost:5001/uploads/companies/avatars/images-2-1774866670805.png	2026-03-30 10:31:56.286854	2026-03-30 10:31:56.286854	Los Angeles, California, United States	\N	\N	34.0536909	-118.2427660
0662b9d1-cc5e-4c94-a3ea-16b48bf698d2	c728acbf-158f-4cf7-94d0-5c547e2b3061	Live Nation Events	Live Nation Events is a leading live entertainment company specializing in concerts, tours, festivals, and large-scale audience experiences. The company is known for producing world-class events, working with major artists, and delivering high-quality performances in top venues across the country. Its mission is to connect fans with unforgettable live moments through outstanding production and event organization.	ebloeblo999@gmail.com	http://localhost:5001/uploads/companies/avatars/live-nation-symbol-1-1774867334962.png	2026-03-30 10:42:57.402808	2026-03-30 10:42:57.402808	Beverly Hills, California, United States	\N	\N	34.0696501	-118.3963062
7db81c55-652d-44d1-a671-3c6b39aa144a	5dbcbfd8-efd5-4f9a-8ef5-4f80e4fba456	FrameHouse Events	FrameHouse Events is a creative company focused on art exhibitions, design showcases, and modern cultural experiences. The company creates visually engaging events that bring together contemporary aesthetics, innovative ideas, and carefully curated atmospheres. Its goal is to connect audiences with inspiring art and design through memorable and well-organized experiences.	norbarg03@gmail.com	http://localhost:5001/uploads/companies/avatars/eventbrite-logo-1-1774867755805.png	2026-03-30 10:49:54.875162	2026-03-30 10:49:54.875162	Chicago, Illinois, United States	\N	\N	41.8755616	-87.6244212
\.


--
-- TOC entry 5076 (class 0 OID 16639)
-- Dependencies: 229
-- Data for Name: company_news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_news (id, company_id, title, content, created_at) FROM stdin;
3e960484-a965-4d2e-8500-51b774676b77	636ac85c-8f92-40d6-9cfc-ce9b7256d08c	hello	hi	2026-03-30 13:09:38.160449
\.


--
-- TOC entry 5074 (class 0 OID 16611)
-- Dependencies: 227
-- Data for Name: event_attendees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_attendees (id, event_id, user_id, order_id, quantity, show_in_visitors, created_at) FROM stdin;
5e2cf0ba-7340-4e20-9a14-51d8aab167c1	f30b3127-d102-4d32-b833-f20e04fbceb9	5dbcbfd8-efd5-4f9a-8ef5-4f80e4fba456	58026a86-959d-436a-b621-c19ecb2e502a	1	t	2026-03-30 12:12:55.606726
f93534ad-72a0-4ee5-9c45-22304b7aa108	f30b3127-d102-4d32-b833-f20e04fbceb9	c728acbf-158f-4cf7-94d0-5c547e2b3061	9c907563-23e3-4e9b-995c-d003aecbe988	2	t	2026-03-30 12:49:01.844911
7a1bca7f-fbea-43da-8d3f-59019efce9c1	f30b3127-d102-4d32-b833-f20e04fbceb9	25f96af5-df82-4194-aeb2-87abe695acca	7d5c6734-abfa-4c02-ad81-c6bae38d6bda	16	t	2026-03-30 12:50:13.844594
\.


--
-- TOC entry 5075 (class 0 OID 16626)
-- Dependencies: 228
-- Data for Name: event_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_subscriptions (id, event_id, user_id, created_at) FROM stdin;
60e5bdc7-f7cd-47c1-931b-e2bb45a78b56	6b806959-92a8-4fd1-9f5d-b763d1f5c03e	c728acbf-158f-4cf7-94d0-5c547e2b3061	2026-03-30 13:09:01.2986
\.


--
-- TOC entry 5069 (class 0 OID 16489)
-- Dependencies: 222
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, company_id, title, description, format, banner_url, poster_url, place_name, place_address, google_maps_url, starts_at, ends_at, published_at, price, tickets_limit, visitors_visibility, notify_on_new_visitor, status, created_at, updated_at, category, google_place_id, place_lat, place_lng, redirect_after_purchase_url) FROM stdin;
6b806959-92a8-4fd1-9f5d-b763d1f5c03e	636ac85c-8f92-40d6-9cfc-ce9b7256d08c	Sombr: North America Tour Live	Experience an unforgettable night with Sombr, filled with raw emotion, captivating vocals, and an electrifying stage presence. This live show brings together powerful performances, intimate moments, and the unique energy that defines his sound. Fans can expect a memorable concert atmosphere and a setlist featuring some of his most loved tracks.	CONCERT	http://localhost:5001/uploads/events/banners/sombr-2-1-1774866270915.png	http://localhost:5001/uploads/events/posters/sombr-merch-1-1774866281586.png	Chicago	The University of Chicago, Chicago, Illinois, United States	\N	2026-04-10 12:45:00	2026-04-10 13:00:00	2026-03-30 13:30:00	100.00	100	ATTENDEES_ONLY	f	PUBLISHED	2026-03-30 10:27:20.058134	2026-03-30 10:27:20.058134	music	\N	41.7913274	-87.6008421	https://github.com/norbarg
f30b3127-d102-4d32-b833-f20e04fbceb9	636ac85c-8f92-40d6-9cfc-ce9b7256d08c	Frank Ocean: Blonde Night Live	Experience an unforgettable night inspired by Frank Ocean’s Blonde, featuring immersive visuals, atmospheric sound, and a live performance vibe. This event brings together fans of alternative R&B, soul, and emotional storytelling for a unique concert experience. Expect a moody, intimate setting filled with iconic tracks and stunning stage design.	CONCERT	http://localhost:5001/uploads/events/banners/screenshot-2026-03-30-at-12-06-02-1-1774865990757.png	http://localhost:5001/uploads/events/posters/frank-ocean-posters-1-1774866006511.png	New York	Mirage Brooklyn, New York, New York, United States	\N	2026-04-10 00:15:00	2026-04-11 13:30:00	2026-03-30 13:23:40.007	23.00	20	PUBLIC	t	PUBLISHED	2026-03-30 10:23:40.008668	2026-03-30 10:23:40.008668	music	\N	40.6778489	-73.9433151	\N
43cd230c-3c7f-4232-98d7-a50ce3f3e395	636ac85c-8f92-40d6-9cfc-ce9b7256d08c	Tyler, The Creator: Call Me If You Get Lost Live	Step into an unforgettable night with Tyler, The Creator inspired by the bold energy of Call Me If You Get Lost. The event will feature a dynamic live atmosphere, striking visuals, and a setlist packed with fan-favorite tracks. It is the perfect experience for fans of creative hip-hop, powerful stage design, and unforgettable performances.	CONCERT	http://localhost:5001/uploads/events/banners/tyler-the-creator-earfquake-2-1-1774866526841.png	http://localhost:5001/uploads/events/posters/tyler-the-creator-poster-1-1774866496784.png	Washington	Supreme Court of the United States, Washington, District of Columbia, United States	\N	2026-04-12 00:00:00	2026-04-13 00:00:00	2026-03-30 13:29:38.156	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:29:38.157414	2026-03-30 10:29:38.157414	music	\N	38.8905926	-77.0044390	\N
95e54bb3-070e-42ba-837b-02161173365b	4a8b2228-45fa-4310-8189-401cd618eab5	Jeff Buckley: It’s Never Over Live Tribute	Experience a soulful evening dedicated to the timeless music and emotional legacy of Jeff Buckley. This special live tribute will feature haunting vocals, intimate atmosphere, and unforgettable performances inspired by his most iconic songs. It is the perfect event for fans of poetic lyrics, alternative rock, and deeply moving live music.	FEST	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-19-56-01-1-1774866770334.png	http://localhost:5001/uploads/events/posters/1-1774866766941.png	Hopewell	Beacon Theatre, Hopewell, Virginia, United States	\N	2026-04-14 00:00:00	2026-04-15 12:45:00	2026-03-30 13:34:31.479	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:34:31.480857	2026-03-30 10:34:31.480857	music	\N	37.3049373	-77.2872528	\N
7d31abad-b380-4d16-8253-807f19677f88	4a8b2228-45fa-4310-8189-401cd618eab5	Charli XCX: Brat Live Night	Get ready for a high-energy night inspired by Charli XCX and the bold attitude of Brat. This event will feature electrifying pop sounds, vibrant visuals, and an unforgettable party atmosphere. It is the perfect concert experience for fans of futuristic pop, iconic performances, and nonstop energy.	FEST	http://localhost:5001/uploads/events/banners/4512c34188a843c143bd966a72423cfd-1-1-1774866954316.png	http://localhost:5001/uploads/events/posters/charli-xcx-for-vanity-fair-2025-1-1-1774866951148.png	Los Angeles	Hollywood Palladium, Los Angeles, California, United States	\N	2026-04-10 00:00:00	2026-04-11 12:45:00	2026-03-30 13:37:02.339	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:37:02.341186	2026-03-30 10:37:02.341186	music	\N	34.0984937	-118.3242932	\N
2121ab21-20cf-4e7b-b691-84f41805eb73	4a8b2228-45fa-4310-8189-401cd618eab5	SZA: SOS Live Experience	Step into an unforgettable night inspired by SZA’s SOS, filled with raw emotion, stunning visuals, and powerful live vocals. This event brings together the energy of modern R&B, intimate storytelling, and a captivating stage atmosphere. It is the perfect concert experience for fans who love soulful performances, iconic songs, and deeply emotional music.	FEST	http://localhost:5001/uploads/events/banners/9217211-1-1774867059800.png	http://localhost:5001/uploads/events/posters/2-1774867054839.png	New York	Barclays Center, New York, New York, United States	\N	2026-04-11 00:00:00	2026-04-12 00:00:00	2026-03-30 13:38:43.322	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:38:43.322881	2026-03-30 10:38:43.322881	music	\N	40.6825106	-73.9752519	\N
364ff118-e429-415a-9012-20ba2ab98720	4a8b2228-45fa-4310-8189-401cd618eab5	The Marías: Cinema Tour Live	Experience a dreamy and unforgettable evening with The Marías, inspired by the cinematic atmosphere of their Cinema era. This event will feature smooth vocals, hypnotic melodies, and an intimate stage production that blends indie pop, soul, and psychedelic sounds. It is the perfect concert for fans who love emotional performances, stylish visuals, and immersive live music.	FEST	http://localhost:5001/uploads/events/banners/chartbreaker-the-marias-billboard-2025-bb3-caroline-tompkins-1-1260-1-1-1-1774867165725.png	http://localhost:5001/uploads/events/posters/2-1-1774867162959.png	New York	Brooklyn Steel, New York, New York, United States	\N	2026-04-13 00:00:00	2026-04-14 00:00:00	2026-03-30 13:40:38.262	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:40:38.263415	2026-03-30 10:40:38.263415	music	\N	40.7193932	-73.9387466	\N
0b88a186-b8a5-4ccd-b8dd-ce6a4bfb102b	0662b9d1-cc5e-4c94-a3ea-16b48bf698d2	Appropriation and Restraint: Paul Fuog Exhibition	Discover a thought-provoking art event inspired by the works of Paul Fuog and the theme of appropriation in contemporary visual culture. This exhibition brings together bold compositions, conceptual storytelling, and a refined gallery atmosphere for an immersive creative experience. It is the perfect event for visitors who appreciate modern art, design, and meaningful artistic dialogue.	LECTURE	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-20-58-36-1-1774867416737.png	http://localhost:5001/uploads/events/posters/appropriation-and-restraint-lecture-poster-fonts-in-use-1-1774867414062.png	Los Angeles	Alexandria Hotel, Los Angeles, California, United States	\N	2026-04-11 00:00:00	2026-04-12 00:00:00	2026-03-30 13:45:03.524	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:45:03.525365	2026-03-30 10:45:03.525365	design	\N	34.0473988	-118.2501466	\N
6def0ce2-4a18-41dd-a643-acf0a2641c9e	0662b9d1-cc5e-4c94-a3ea-16b48bf698d2	Future Vision: Contemporary Art Exhibition	Discover a striking contemporary art exhibition that explores identity, perception, and the visual language of the future. This event brings together bold design, modern portraits, and immersive artistic concepts in a refined gallery atmosphere. It is the perfect experience for visitors who appreciate innovative curation, contemporary aesthetics, and thought-provoking visual art.	LECTURE	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-20-38-45-1-1774867589388.png	http://localhost:5001/uploads/events/posters/4-1-1774867586787.png	San Francisco	San Francisco Museum of Modern Art, San Francisco, California, United States	\N	2026-04-11 00:00:00	2026-04-12 00:00:00	2026-03-30 13:48:11.544	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:48:11.545622	2026-03-30 10:48:11.545622	design	\N	37.7859150	-122.4007359	\N
45f4c68b-5471-4b98-b6a8-7bbe8eda2b72	7db81c55-652d-44d1-a671-3c6b39aa144a	Open Architecture Autumn Lecture Series	Join an inspiring lecture event focused on contemporary architecture, urban design, and creative thinking. This series brings together leading voices to discuss new ideas, modern spaces, and the future of architectural practice. It is the perfect event for students, designers, and anyone interested in innovative architecture and visual culture.	LECTURE	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-21-06-32-1-1774867830976.png	http://localhost:5001/uploads/events/posters/architecture-open-lecture-series-to-host-enrique-sobejano-and-patrik-schumacher-this-autumn-estonian-academy-of-arts-1-1774867827600.png	Chicago	Chicago Architecture Center, Chicago, Illinois, United States	\N	2026-04-12 00:00:00	2026-04-13 00:00:00	2026-03-30 13:51:35.999	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:51:35.999957	2026-03-30 10:51:35.999957	technology	\N	41.8880131	-87.6236228	\N
bd0d9822-0397-49ba-bc4b-b28cc2515956	7db81c55-652d-44d1-a671-3c6b39aa144a	Face to Face: Contemporary Visual Design Talk	Explore a bold creative event focused on visual identity, graphic experimentation, and modern design language. This experience brings together striking imagery, contemporary concepts, and thoughtful discussion in an inspiring atmosphere. It is perfect for designers, artists, and anyone interested in typography, branding, and visual culture.	CONFERENCE	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-21-13-21-1-1774867958614.png	http://localhost:5001/uploads/events/posters/2-2-1774867955746.png	Chicago	The Museum of Contemporary Photography, Chicago, Illinois, United States	\N	2026-04-12 00:00:00	2026-04-13 00:00:00	2026-03-30 13:54:03.871	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:54:03.872353	2026-03-30 10:54:03.872353	psychology	\N	41.8742073	-87.6245139	\N
a5abe537-f234-46ef-9eec-95c11a9e8aa5	7db81c55-652d-44d1-a671-3c6b39aa144a	Red Frame: Experimental Design Exhibition	Discover a bold design event centered on abstraction, visual identity, and contemporary graphic expression. This exhibition blends geometric forms, striking contrasts, and modern composition into an immersive creative experience. It is ideal for visitors who appreciate experimental design, minimal aesthetics, and thought-provoking visual art.	WORKSHOP	http://localhost:5001/uploads/events/banners/screenshot-2026-03-29-at-21-09-21-1-1774868076470.png	http://localhost:5001/uploads/events/posters/3-1-1774868073972.png	New York	Cooper–Hewitt, Smithsonian Design Museum, New York, New York, United States	\N	2026-04-12 00:00:00	2026-04-13 00:00:00	2026-03-30 13:56:12.704	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:56:12.705671	2026-03-30 10:56:12.705671	design	\N	40.7842843	-73.9576990	\N
dca515db-f7b2-4e92-956e-490357e9d945	7db81c55-652d-44d1-a671-3c6b39aa144a	City as Stage: Urban Visual Culture Lecture	Explore a thought-provoking event about the city as a space for identity, performance, and visual expression. This lecture examines how urban environments and suburban culture shape perception, creativity, and contemporary design. It is ideal for students, artists, and anyone interested in architecture, media, and cultural studies.	CONFERENCE	http://localhost:5001/uploads/events/banners/group-46-1774868216933.png	http://localhost:5001/uploads/events/posters/screenshot-2026-03-29-at-20-27-02-1-1774868214233.png	New York	The New School, New York, New York, United States	\N	2026-04-11 00:00:00	2026-04-12 00:00:00	2026-03-30 13:57:59.772	100.00	100	PUBLIC	t	PUBLISHED	2026-03-30 10:57:59.773422	2026-03-30 10:57:59.773422	film	\N	40.7354792	-73.9970709	\N
\.


--
-- TOC entry 5072 (class 0 OID 16557)
-- Dependencies: 225
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, body, sent_via_email, sent_via_site, is_read, created_at) FROM stdin;
d7444983-b0a3-4bc7-8336-946d1dcbc293	d9bdee13-e4ca-4a35-a63c-0137603a77cd	NEW_EVENT_VISITOR	New visitor for Frank Ocean: Blonde Night Live	123_123 has joined your event.	f	t	t	2026-03-30 12:12:55.61598
1688911d-b35c-42f8-bd1c-d40fc72f7251	d9bdee13-e4ca-4a35-a63c-0137603a77cd	NEW_EVENT_VISITOR	New visitor for Frank Ocean: Blonde Night Live	ab_cd has joined your event.	f	t	t	2026-03-30 12:49:01.852798
56e5c22b-5c90-46e5-a1d3-1552916e474c	d9bdee13-e4ca-4a35-a63c-0137603a77cd	NEW_EVENT_VISITOR	New visitor for Frank Ocean: Blonde Night Live	darina_zotova has joined your event.	f	t	t	2026-03-30 12:50:13.854121
f3142bea-e230-453c-82c6-b7d86d26faf5	c728acbf-158f-4cf7-94d0-5c547e2b3061	COMPANY_NEWS	Spotify: hello	hi	t	t	t	2026-03-30 13:09:38.1692
41729bc9-a011-4a70-bcea-65e8df0957da	c728acbf-158f-4cf7-94d0-5c547e2b3061	NEW_EVENT	New event from Spotify	bfd is now available.	t	t	t	2026-03-30 13:10:33.213514
\.


--
-- TOC entry 5073 (class 0 OID 16587)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, event_id, promo_code_id, quantity, unit_price, discount_percent, total_price, show_user_in_visitors, stripe_checkout_session_id, stripe_payment_intent_id, payment_status, paid_at, created_at, updated_at) FROM stdin;
7d5c6734-abfa-4c02-ad81-c6bae38d6bda	25f96af5-df82-4194-aeb2-87abe695acca	f30b3127-d102-4d32-b833-f20e04fbceb9	\N	16	23.00	0	368.00	t	cs_test_a1JxAQ3NnV5uhnZp14l0pZcUBEmah39Q3JYprG00q7iVNX96uPtkGqQB61	pi_3TGfGiF2wbcXB4az1CI91hIp	PAID	2026-03-30 15:50:13.838	2026-03-30 12:49:49.455307	2026-03-30 12:50:13.839387
a10322f7-e7e5-4768-a14c-e45d3d8ad748	5dbcbfd8-efd5-4f9a-8ef5-4f80e4fba456	f30b3127-d102-4d32-b833-f20e04fbceb9	213b51f6-b337-4df5-bfbf-e763280bd5dd	1	23.00	10	20.70	t	cs_test_a1bC4YpEmCn6PDmrNtArbzbKV19LhvOT2f0fZIgUu9CeKQ3T8WQKZzX15M	\N	PENDING	\N	2026-03-30 12:11:19.962686	2026-03-30 12:11:20.716005
58026a86-959d-436a-b621-c19ecb2e502a	5dbcbfd8-efd5-4f9a-8ef5-4f80e4fba456	f30b3127-d102-4d32-b833-f20e04fbceb9	\N	1	23.00	0	23.00	t	cs_test_a1txu5CPlTCjaibM7WvKYIoTFFSwO8iFFmcke1efSMCCSkcvkzJ5q9nAY9	pi_3TGegcF2wbcXB4az0pAZ0353	PAID	2026-03-30 15:12:55.6	2026-03-30 12:12:34.532038	2026-03-30 12:12:55.60274
9c907563-23e3-4e9b-995c-d003aecbe988	c728acbf-158f-4cf7-94d0-5c547e2b3061	f30b3127-d102-4d32-b833-f20e04fbceb9	\N	2	23.00	0	46.00	t	cs_test_a1wErxqQOpRLadKACmlktfB5d4TQnjWPEyEYnYi8sFRx2nU8sQ9d73d7zA	pi_3TGfFYF2wbcXB4az09nUbnEG	PAID	2026-03-30 15:49:01.84	2026-03-30 12:48:42.557599	2026-03-30 12:49:01.841607
\.


--
-- TOC entry 5071 (class 0 OID 16534)
-- Dependencies: 224
-- Data for Name: organizer_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizer_subscriptions (id, company_id, user_id, created_at) FROM stdin;
de9af9ce-3ff2-4072-9212-b07739eefce9	636ac85c-8f92-40d6-9cfc-ce9b7256d08c	c728acbf-158f-4cf7-94d0-5c547e2b3061	2026-03-30 13:09:03.938237
\.


--
-- TOC entry 5070 (class 0 OID 16518)
-- Dependencies: 223
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promo_codes (id, event_id, code, discount_percent, created_at) FROM stdin;
213b51f6-b337-4df5-bfbf-e763280bd5dd	f30b3127-d102-4d32-b833-f20e04fbceb9	PROMO	10	2026-03-30 10:23:40.027407
2dea7a4f-5558-48e5-b494-cffeb49417c2	6b806959-92a8-4fd1-9f5d-b763d1f5c03e	PROMO	10	2026-03-30 10:27:20.073887
90dbda62-8f7d-4f79-911e-2eac3852cf4a	95e54bb3-070e-42ba-837b-02161173365b	PROMO	10	2026-03-30 10:34:31.501469
0f704bbc-5bb2-4432-833f-193e5a924f45	7d31abad-b380-4d16-8253-807f19677f88	PROMO	10	2026-03-30 10:37:02.355543
be3ebc95-d21c-4367-bf50-32a0ec55a9ee	2121ab21-20cf-4e7b-b691-84f41805eb73	PROMO	10	2026-03-30 10:38:43.339229
b2edca80-13e8-47dd-a7e3-5fcdc63c79dc	364ff118-e429-415a-9012-20ba2ab98720	PROMO	10	2026-03-30 10:40:38.279701
7c3a3657-0808-4bec-acae-0a2aba8e5d31	364ff118-e429-415a-9012-20ba2ab98720	PROMO2	20	2026-03-30 10:40:38.287314
bd3bf52a-8a7b-4c8f-b16e-27780ab239eb	0b88a186-b8a5-4ccd-b8dd-ce6a4bfb102b	PROMO	10	2026-03-30 10:45:03.54172
67ea214d-3be6-4c49-89c8-7e2fac712fcb	6def0ce2-4a18-41dd-a643-acf0a2641c9e	PROMO	10	2026-03-30 10:48:11.561772
fc5082f6-b20b-462e-96b2-1936b2d245e4	bd0d9822-0397-49ba-bc4b-b28cc2515956	PROMO	10	2026-03-30 10:54:03.893525
f4bfa530-e37c-4ce7-947f-085d7d03328a	a5abe537-f234-46ef-9eec-95c11a9e8aa5	PROMO	10	2026-03-30 10:56:12.722391
5d2194ba-2c34-419c-97c1-4e5825986391	dca515db-f7b2-4e92-956e-490357e9d945	PROMO	10	2026-03-30 10:57:59.788445
\.


--
-- TOC entry 5067 (class 0 OID 16417)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, login, password_hash, auth_provider, google_id, role, created_at, updated_at) FROM stdin;
25f96af5-df82-4194-aeb2-87abe695acca	zotovad21@gmail.com	darina_zotova	\N	GOOGLE	103605631047940191463	USER	2026-03-30 10:12:54.71929	2026-03-30 10:12:54.71929
d9bdee13-e4ca-4a35-a63c-0137603a77cd	koliasleshev@gmail.com	norbarg	\N	GOOGLE	109447703287862391238	USER	2026-03-30 10:13:38.25811	2026-03-30 10:13:38.25811
c728acbf-158f-4cf7-94d0-5c547e2b3061	ebloeblo999@gmail.com	ab_cd	\N	GOOGLE	112595798777605447731	USER	2026-03-30 10:41:12.14931	2026-03-30 10:41:12.14931
5dbcbfd8-efd5-4f9a-8ef5-4f80e4fba456	norbarg03@gmail.com	123_123	\N	GOOGLE	110745296650098798427	USER	2026-03-30 10:48:47.339271	2026-03-30 10:48:47.339271
16094090-80e6-4626-adf8-ac47dbd85928	lut4ui.v.mire@gmail.com	koliaka	$2b$10$CoyByhZYCoG22q65GJ4m9.uc94snwA.EubYzoU3.sPb3AFQle.vme	LOCAL_GOOGLE	118260883564052803785	ADMIN	2026-03-30 10:08:17.609304	2026-03-30 13:05:04.058959
\.


--
-- TOC entry 4894 (class 2606 OID 16625)
-- Name: event_attendees PK_27510e317f002b361d2904d7f0f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "PK_27510e317f002b361d2904d7f0f" PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 16517)
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16577)
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 16610)
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 16666)
-- Name: comments PK_8bf68bc960f2b69e818bdb90dcb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 16636)
-- Name: event_subscriptions PK_9e4944140dfbdb8a75c8f3d9bce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions
    ADD CONSTRAINT "PK_9e4944140dfbdb8a75c8f3d9bce" PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 16652)
-- Name: company_news PK_9e73481ee8a4a481bd27c1ebc29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_news
    ADD CONSTRAINT "PK_9e73481ee8a4a481bd27c1ebc29" PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 16435)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 16544)
-- Name: organizer_subscriptions PK_a674f318261360eab208e0da1ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT "PK_a674f318261360eab208e0da1ce" PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 16531)
-- Name: promo_codes PK_c7b4f01710fda5afa056a2b4a35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT "PK_c7b4f01710fda5afa056a2b4a35" PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 16457)
-- Name: companies PK_d4bc3e82a314fa9e29f652c2c22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 16441)
-- Name: users UQ_0bd5012aeb82628e07f6a1be53b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE (google_id);


--
-- TOC entry 4872 (class 2606 OID 16439)
-- Name: users UQ_2d443082eccd5198f95f2a36e2c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE (login);


--
-- TOC entry 4884 (class 2606 OID 16533)
-- Name: promo_codes UQ_779d73e7d9aede29a4399084588; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT "UQ_779d73e7d9aede29a4399084588" UNIQUE (event_id, code);


--
-- TOC entry 4874 (class 2606 OID 16437)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 4878 (class 2606 OID 16459)
-- Name: companies UQ_a2e26270eefa893caca40d8de4e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "UQ_a2e26270eefa893caca40d8de4e" UNIQUE (owner_user_id);


--
-- TOC entry 4898 (class 2606 OID 16638)
-- Name: event_subscriptions UQ_ad42f58c58e3628743bfdcaaee7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions
    ADD CONSTRAINT "UQ_ad42f58c58e3628743bfdcaaee7" UNIQUE (event_id, user_id);


--
-- TOC entry 4888 (class 2606 OID 16546)
-- Name: organizer_subscriptions UQ_b81e93f61fe32ecbfaa12a28188; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT "UQ_b81e93f61fe32ecbfaa12a28188" UNIQUE (company_id, user_id);


--
-- TOC entry 4906 (class 2606 OID 16682)
-- Name: organizer_subscriptions FK_1651950f112354360f826682193; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT "FK_1651950f112354360f826682193" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4909 (class 2606 OID 16707)
-- Name: orders FK_1e7814b20d15af2aa03320e0451; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_1e7814b20d15af2aa03320e0451" FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id) ON DELETE SET NULL;


--
-- TOC entry 4905 (class 2606 OID 16677)
-- Name: promo_codes FK_1ebec1c7d9c344f85c9af5313e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT "FK_1ebec1c7d9c344f85c9af5313e8" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4915 (class 2606 OID 16727)
-- Name: event_subscriptions FK_542fdf1b0cdc0c498e9fb94d280; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions
    ADD CONSTRAINT "FK_542fdf1b0cdc0c498e9fb94d280" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4917 (class 2606 OID 16737)
-- Name: company_news FK_5670a0cad9d9c240ccb4dffd58c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_news
    ADD CONSTRAINT "FK_5670a0cad9d9c240ccb4dffd58c" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4910 (class 2606 OID 16702)
-- Name: orders FK_642ca308ac51fea8327e593b8ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_642ca308ac51fea8327e593b8ab" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4916 (class 2606 OID 16732)
-- Name: event_subscriptions FK_7ce36bb47ff22f2c62c978b2b66; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions
    ADD CONSTRAINT "FK_7ce36bb47ff22f2c62c978b2b66" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4908 (class 2606 OID 16692)
-- Name: notifications FK_9a8a82462cab47c73d25f49261f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4903 (class 2606 OID 16667)
-- Name: companies FK_a2e26270eefa893caca40d8de4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "FK_a2e26270eefa893caca40d8de4e" FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4911 (class 2606 OID 16697)
-- Name: orders FK_a922b820eeef29ac1c6800e826a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 16742)
-- Name: comments FK_acb7ccd75fdad8ca158e1360a13; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_acb7ccd75fdad8ca158e1360a13" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 16672)
-- Name: events FK_b97c36be0cf65565fad88588c28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "FK_b97c36be0cf65565fad88588c28" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4912 (class 2606 OID 16712)
-- Name: event_attendees FK_c296e70709cd6f4cb6b4e3e7e2a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "FK_c296e70709cd6f4cb6b4e3e7e2a" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 16747)
-- Name: comments FK_ca96de050d1b690cefccebc7dc8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_ca96de050d1b690cefccebc7dc8" FOREIGN KEY (author_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4913 (class 2606 OID 16722)
-- Name: event_attendees FK_d950128a5a881a0adf5c645ee3f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "FK_d950128a5a881a0adf5c645ee3f" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4907 (class 2606 OID 16687)
-- Name: organizer_subscriptions FK_f6ace360ec9ee4d38148e602790; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT "FK_f6ace360ec9ee4d38148e602790" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 16717)
-- Name: event_attendees FK_ff98c4d7c3e85237115140cf69e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "FK_ff98c4d7c3e85237115140cf69e" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-03-30 17:05:56

--
-- PostgreSQL database dump complete
--

\unrestrict JkfmO3u4aGLB8idZZfapcddx9rpWvlFsKb89TsnNOdELhyiAqSnDnIf3r8gkSOU

