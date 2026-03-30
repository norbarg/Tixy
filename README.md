# Tixy

Tixy is a web application for creating, discovering, following, and purchasing tickets for events. The platform is focused on a clean user experience for both organizers and attendees: organizers can create companies and publish events, while users can browse upcoming events, subscribe to events or companies, buy tickets, receive notifications, and access their purchased tickets.

## Project Overview

Tixy was built as a university project and includes both a frontend and a backend part.

The application supports:

- user registration and login
- Google authentication
- company creation and management
- event creation and management
- event search and filtering
- company and event subscriptions
- comments
- attendee visibility rules
- promo codes
- order creation
- Stripe checkout
- PDF ticket generation
- notifications
- admin moderation tools

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- React DatePicker
- Leaflet
- OpenStreetMap
- Photon API for place autocomplete

### Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger
- Stripe
- PDF generation for tickets

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL container
- Separate frontend and backend containers

---

## Main Features

## Authentication

Users can:

- register with login, email, and password
- log in with email or login
- log in with Google
- log out
- restore authenticated state using access and refresh tokens

## Companies

Authenticated users can:

- create one company
- upload company avatar
- edit company information
- set company location
- follow and unfollow companies

Each company includes:

- title
- description
- email
- avatar
- place address
- optional coordinates and map-related fields

## Events

Organizers can:

- create events
- upload poster and banner
- choose event format
- choose category
- specify visibility settings
- set publication date
- add promo codes
- choose a redirect URL after successful purchase

Each event includes:

- title
- description
- format
- category
- poster
- banner
- place name
- place address
- map coordinates
- start and end date
- publication date
- redirect-after-purchase URL
- price
- ticket limit
- attendee visibility rules

## Home Page

The home page includes:

- banner slider based on event banners
- search by event/company
- place autocomplete using Photon
- date filter
- format and category filters
- upcoming events grid
- reusable event cards
- load more pagination
- company slider
- call-to-action section
- footer

## Event Details Page

The event details page includes:

- event banner
- title and follow button
- description
- date and location
- map with event marker
- purchase card
- quantity selector
- promo code input
- participant visibility checkbox
- ticket purchase button
- sold out state
- attendee list
- comments section
- company information
- events from the same company
- similar events by category

## Orders and Payments

Users can:

- create an order
- apply promo code
- choose quantity
- choose whether to appear in attendee list
- go through Stripe checkout
- receive redirect after successful payment

Payment flow:

1. user opens event details page
2. user selects ticket quantity
3. user creates an order
4. Stripe checkout session is created
5. user pays on Stripe
6. backend processes webhook
7. order becomes paid
8. attendee record is created
9. PDF ticket becomes available
10. user is redirected either to organizer-defined URL or fallback page

## Tickets

The backend generates PDF tickets for paid orders.

There are endpoints for:

- real ticket by order
- preview ticket by order

## Notifications

Users receive notifications for:

- new events from followed companies
- other subscription-based updates
- reminder before event start

The frontend header includes:

- unread notifications dot
- notifications popover
- mark as read support

## Comments

Users can:

- leave comments on events
- delete their own comments

Admins can:

- delete any comment
- review all comments in admin panel

## Admin Panel

Admins can manage:

- users
- companies
- events
- comments

## Attendee Visibility Logic

Events support two attendee visibility modes:

- public attendee list
- attendee list visible only to ticket holders

If attendee visibility is restricted, non-ticket-holders do not see attendees, but the rest of the event page still loads normally.

## Search and Location

The project does not use Google Places for autocomplete.

Instead it uses:

- Photon for place suggestions
- OpenStreetMap / Leaflet for maps

This was chosen because it is more suitable for a university project and does not require paid Google APIs.

## Event Sorting and Availability

Public events are sorted so that relevant upcoming events are shown first.

Ticket availability is controlled by:

- event ticket limit
- already reserved or paid orders

The backend validates real availability before creating an order.  
The frontend also reflects available quantity and displays `Sold Out` when no tickets remain.

---

## Project Structure

### Frontend structure

Typical frontend folders:

- `src/api` — API clients
- `src/assets` — images and icons
- `src/components` — reusable UI components
- `src/context` — auth and cart context
- `src/pages` — application pages
- `src/types` — TypeScript models
- `src/lib` — helper utilities such as Photon place search

### Backend structure

Typical backend folders:

- `src/modules/auth`
- `src/modules/users`
- `src/modules/companies`
- `src/modules/events`
- `src/modules/comments`
- `src/modules/orders`
- `src/modules/payments`
- `src/modules/promo-codes`
- `src/modules/attendees`
- `src/modules/subscriptions`
- `src/modules/notifications`
- `src/modules/tickets`
- `src/modules/uploads`
- `src/database/entities`

---

## Key Business Rules

- one user can own only one company
- only company owners can create events
- event end date must be later than start date
- location coordinates must be complete if used
- ticket quantity cannot exceed available tickets
- comments can be deleted only by the author or admin
- attendee list visibility depends on event settings
- redirect after purchase is optional
- if redirect URL is not provided, fallback redirect is used

---

## Current State of the Project

At this stage, the project already includes:

- complete authentication flow
- company creation
- event creation
- homepage with filters
- event details page
- orders
- Stripe checkout
- notifications popover
- ticket PDF generation
- comments
- subscriptions
- admin panel basics
- Dockerized frontend, backend, and database

---

## Requirements

Before starting the project, make sure you have installed:

- Docker Desktop
- Git
- Stripe CLI
- pgAdmin or PostgreSQL tools if you want to import/export database manually

---

## Environment Configuration

### Backend local environment

File: `backend/.env`

```env
PORT=5001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=tixy_db

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15d
JWT_REFRESH_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_email_app_password
SMTP_FROM=your_email
```

### Backend Docker environment

File: `backend/.env.docker`

```env
PORT=5001

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=tixy_db

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15d
JWT_REFRESH_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_email_app_password
SMTP_FROM=your_email
```

Important:

- for local launch without Docker, database host is `localhost`
- for Docker launch, database host is `postgres`

---

## Docker Setup

The project is split into three containers:

- `tixy_frontend`
- `tixy_backend`
- `tixy_postgres`

The database uses a Docker volume so data is persisted between restarts.

---

## How to Start the Project

From the root of the project, run:

```bash
docker compose up --build
```

If the images are already built and you only want to start containers:

```bash
docker compose up
```

If you want to run everything in the background:

```bash
docker compose up -d
```

After startup:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5001`
- database: `localhost:5432`

---

## How to Stop the Project

To stop containers:

```bash
docker compose stop
```

To stop and remove containers, network, but keep database volume:

```bash
docker compose down
```

To stop and remove everything including database data volume:

```bash
docker compose down -v
```

Use `down -v` only if you really want to fully reset the database.

---

## How to Restart the Project

Restart all services:

```bash
docker compose restart
```

Restart only backend:

```bash
docker compose restart backend
```

Restart only frontend:

```bash
docker compose restart frontend
```

Restart only database:

```bash
docker compose restart postgres
```

---

## How to Rebuild the Project

If you changed Dockerfiles or dependencies:

```bash
docker compose up --build
```

If needed, rebuild without cache:

```bash
docker compose build --no-cache
docker compose up
```

---

## Stripe for Local Development

For payments to work locally, Stripe CLI must be running separately.

Run:

```powershell
& "C:\dev\stripe-cli\stripe.exe" listen --forward-to localhost:5001/api/payments/webhook
```

Stripe CLI listens for Stripe events and forwards them to your backend webhook.

Important:

- if Stripe CLI gives you a new webhook secret, update `STRIPE_WEBHOOK_SECRET` in `backend/.env.docker`
- after changing it, restart backend:

```bash
docker compose restart backend
```

---

## Google Authentication in Docker

Google authentication works with Docker as long as the following callback is configured in Google Cloud Console:

```text
http://localhost:5001/api/auth/google/callback
```

Authorized JavaScript origins should include:

```text
http://localhost:5173
http://localhost:5001
```

---

## Database Import from Local PostgreSQL into Docker

If you already had a local PostgreSQL database and want to move data into Docker:

### Option 1: Export through pgAdmin

1. Right-click the local database `tixy_db`
2. Choose `Backup...`
3. Save as `Plain` format, for example:

```text
C:\path\to\project\tixy_db.sql
```

### Option 2: Import into Docker database

Copy SQL file into the postgres container:

```bash
docker cp .\tixy_db.sql tixy_postgres:/tixy_db.sql
```

Drop old Docker database:

```bash
docker exec -it tixy_postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS tixy_db;"
```

Create a fresh database:

```bash
docker exec -it tixy_postgres psql -U postgres -d postgres -c "CREATE DATABASE tixy_db;"
```

Restore data:

```bash
docker exec -i tixy_postgres psql -U postgres -d tixy_db -f /tixy_db.sql
```

Restart backend:

```bash
docker compose restart backend
```

---

## Useful Docker Commands

Show running containers:

```bash
docker ps
```

Show all containers:

```bash
docker ps -a
```

Show backend logs:

```bash
docker logs tixy_backend
```

Show postgres logs:

```bash
docker logs tixy_postgres
```

Follow backend logs in real time:

```bash
docker logs -f tixy_backend
```

Open shell inside backend container:

```bash
docker exec -it tixy_backend sh
```

Open PostgreSQL shell inside database container:

```bash
docker exec -it tixy_postgres psql -U postgres -d tixy_db
```

---

## Notes

- frontend and backend run in separate Docker containers
- database data is stored in a Docker volume
- Stripe CLI still runs locally outside Docker
- Google auth, SMTP, Stripe, and JWT all depend on correct environment variables
- for development, `synchronize: true` is enabled in TypeORM

---

## Planned Improvements

Planned or possible next improvements:

- production deployment configuration
- `.env.example` files
- better cart persistence
- ticket availability refresh without page reload
- stronger handling of expired pending orders
- improved admin analytics
- more polished mobile responsiveness in some sections

---

## Team Roles

Project roles during development:

- frontend development
- backend development
- integration between frontend and backend

---

## Notes

This project was developed as an educational product and demonstrates a full-stack event platform with real backend logic, authentication, payments, subscriptions, notifications, maps, and file generation.
