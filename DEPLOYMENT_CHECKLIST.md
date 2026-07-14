# Public launch checklist

## Accounts and credentials

- MongoDB Atlas database and project-specific database user
- Cloudinary account for customer-facing images and videos
- Optional OpenAI API key for richer catalogue and care answers
- Domain name and three deploy targets: customer, admin, and API

## Recommended hosting

- Customer and admin Vite builds: Vercel, Netlify, or Cloudflare Pages
- Express API: Render, Railway, Fly.io, or another always-on Node host
- Database: MongoDB Atlas
- Media: Cloudinary

## Required production configuration

- Backend `CUSTOMER_APP_URL` and `ADMIN_APP_URL` must exactly match the deployed origins.
- Both frontends must use the deployed API URL.
- Set `NODE_ENV=production`.
- Generate independent long values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`.
- Store all server secrets only in the backend host's secret settings.
- Enable HTTPS everywhere.

## Launch tests

- Confirm the admin URL requires login.
- Confirm customers cannot call add/edit/delete endpoints.
- Upload one image and one short video.
- Create, edit, reserve, sell, and delete a test listing.
- Submit a test enquiry and update every order state.
- Request human chat as a customer and accept/reply as admin.
- Check navigation, forms, and chat on a small phone and desktop.
- Confirm no demo fish remain once the live database is connected.

