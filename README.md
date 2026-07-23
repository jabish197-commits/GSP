# SJ Guppy Paradise

A complete responsive guppy catalogue and enquiry system with a separate private admin panel.

## Included

- Mobile and desktop customer website
- Searchable live fish catalogue and fish detail pages
- Customer enquiry list and order request form
- Customer email/password, Google, and Facebook authentication
- AI FAQ assistant with safe catalogue-aware answers
- Human-chat request that stays pending until the admin accepts it
- Private admin authentication using an HTTP-only cookie
- Fish creation, editing, status, quantity, featured listing, image and video management
- Customer enquiry status management
- Admin chat acceptance, replies, and closing
- Public contact and homepage settings
- MongoDB Atlas models, Cloudinary media upload, rate limits, validation, and security headers

The three bundled catalogue photographs are generated demonstration assets so the local preview looks complete before MongoDB is connected. Replace them with photographs of the actual fish offered for sale through the admin panel before public launch.

## Local setup

Requirements: Node.js 20 or newer, MongoDB Atlas, and Cloudinary. OpenAI is optional because a safe built-in FAQ assistant is used when no API key is configured.

1. Run `npm install` in this folder.
2. Copy `server/.env.example` to `server/.env` and enter the private values.
3. Copy `customer-app/.env.example` to `customer-app/.env`.
4. Copy `admin-app/.env.example` to `admin-app/.env`.
5. Run `npm run create-admin --workspace server` once.
6. Remove `ADMIN_INITIAL_PASSWORD` from `server/.env` after the admin is created.
7. Start the API with `npm run dev:server`.
8. Start the customer site with `npm run dev:customer`.
9. Start the admin panel with `npm run dev:admin`.

Local addresses:

- Customer: `http://localhost:5173`
- Admin: `http://localhost:5174`
- API health: `http://localhost:5000/api/health`

## Production addresses

Recommended:

- `https://sjguppyparadise.com` — customer website
- `https://admin.sjguppyparadise.com` — admin panel
- `https://api.sjguppyparadise.com` — backend API

Update the three `.env` files with these production addresses before deploying. Never place MongoDB, Cloudinary, JWT, admin, or OpenAI secrets in either Vite application.

## Verification

Run `npm run check`. This creates production builds for both websites and checks the backend entry files.

## Social customer login

Google and Facebook customer login setup is documented in `SOCIAL_LOGIN_SETUP.md`. OAuth client secrets must be stored only in the API deployment environment.

Automatic registration welcomes use the WhatsApp Business Cloud API and an approved template. Configure only the API project with `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WELCOME_TEMPLATE`, `WHATSAPP_TEMPLATE_LANGUAGE`, `WHATSAPP_GRAPH_VERSION`, and `WHATSAPP_DEFAULT_COUNTRY_CODE`. The template body must accept the customer's name as `{{1}}`; a suitable message is: `Welcome to SJ Guppy Paradise, {{1}}! You are successfully registered. Book your guppy order here: https://sj-guppy-paradise.vercel.app`.

## Postman API testing

Import the collection and environment from the `postman` folder. Detailed request order, examples, allowed status values, authentication behaviour, and media-upload steps are provided in `POSTMAN_API_GUIDE.md`.

## Before opening to customers

- Enter the real contact, WhatsApp, location, and delivery information in Admin > Site settings.
- Add real guppy listings and upload optimized images.
- Test an enquiry from a phone and desktop.
- Test AI chat, request the breeder, accept it in admin, reply, and close it.
- Use a strong unique admin password and long random secrets.
- Restrict MongoDB Atlas access to the backend host.
- Configure Cloudinary upload limits and backups.
- Add privacy, refund, delivery, live-arrival, and animal welfare policies appropriate to your business and location.
