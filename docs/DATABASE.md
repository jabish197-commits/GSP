# Database

MongoDB Atlas stores administrators, fish, enquiries, chat sessions, care guides, and site settings.

Main collections:

- `admins`: encrypted administrator credentials
- `fish`: catalogue information and Cloudinary media URLs
- `orders`: customer enquiries and status history
- `chats`: AI and human messages with approval status
- `careguides`: public care articles
- `sitesettings`: public business details

Create a project-specific Atlas database user and restrict network access to the deployed backend.
