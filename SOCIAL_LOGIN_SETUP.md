# Google and Facebook customer login

The application uses the OAuth 2.0 authorization-code flow. Provider secrets belong only in the **API Vercel project**, never in either Vite application or GitHub.

## API environment variables

Add these variables to the `sj-guppy-paradise-api` Vercel project for Production and Preview:

```env
GOOGLE_CLIENT_ID=your_google_web_client_id
GOOGLE_CLIENT_SECRET=your_google_web_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_GRAPH_VERSION=v25.0
OAUTH_CALLBACK_BASE_URL=https://sj-guppy-paradise.vercel.app/api
```

Keep the existing value:

```env
CUSTOMER_APP_URL=https://sj-guppy-paradise.vercel.app
```

Redeploy the API after saving the variables.

## Google Cloud setup

1. Open Google Cloud Console and select or create the SJ Guppy Paradise project.
2. Configure the OAuth consent screen. Use External users, add the website information, and add test users while the app is in testing.
3. Create an OAuth client with application type **Web application**.
4. Add this authorized JavaScript origin:

   `https://sj-guppy-paradise.vercel.app`

5. Add this authorized redirect URI exactly:

   `https://sj-guppy-paradise.vercel.app/api/customer-auth/oauth/google/callback`

6. Copy the Client ID and Client Secret into the API Vercel environment variables.
7. Publish the consent screen when it is ready for customers.

For local development, also add:

`http://localhost:5000/api/customer-auth/oauth/google/callback`

## Meta/Facebook setup

1. Create a Meta developer app and add Facebook Login for the web.
2. Set the website URL to:

   `https://sj-guppy-paradise.vercel.app`

3. Add this valid OAuth redirect URI exactly:

   `https://sj-guppy-paradise.vercel.app/api/customer-auth/oauth/facebook/callback`

4. Add `sj-guppy-paradise.vercel.app` to App Domains.
5. Use these public policy URLs:

   - Privacy policy: `https://sj-guppy-paradise.vercel.app/privacy`
   - User data deletion: `https://sj-guppy-paradise.vercel.app/data-deletion`

6. Copy the App ID and App Secret into the API Vercel environment variables.
7. Keep the `email` and `public_profile` permissions enabled and switch the app to Live mode when configuration is complete.

For local development, also add:

`http://localhost:5000/api/customer-auth/oauth/facebook/callback`

## Deployment order

1. Deploy the API project.
2. Confirm `https://sj-guppy-paradise-api.vercel.app/api/health` returns `"status":"ok"`.
3. Deploy the customer project.
4. Open `https://sj-guppy-paradise.vercel.app/login`.
5. Test Google and Facebook in a private/incognito browser window.

The first social login creates a customer account. If the verified provider email already belongs to an existing customer, the provider is linked to that customer instead of creating a duplicate.
