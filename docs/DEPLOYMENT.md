# Deployment

Recommended production layout:

- Customer: `https://sjguppyparadise.com`
- Admin: `https://admin.sjguppyparadise.com`
- API: `https://api.sjguppyparadise.com`

Deploy the two Vite builds to a static host and the Express server to a Node host. Store MongoDB, Cloudinary, OpenAI, JWT, cookie, and admin credentials only on the backend host. Enable HTTPS and update all three environment files with the final URLs.
