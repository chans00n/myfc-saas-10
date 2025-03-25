# Legal Documents Section

This directory contains legal and informational pages for the My Facial Fitness application.

## Structure

- `layout.tsx` - Layout component that adds navigation and standard styling to all legal pages
- `page.tsx` - Index page with links to all legal documents
- `privacy-policy/` - Privacy Policy page
- `terms-of-service/` - Terms of Service page
- `changelog/` - Changelog showing version history

## Purpose

These pages provide essential legal information for users of the application, including:

1. How user data is collected and used (Privacy Policy)
2. Rules and regulations for using the service (Terms of Service)
3. Record of platform updates and changes (Changelog)

## Note on Content

The current content is placeholder text. Before deployment to production, have a legal professional review and customize these documents to accurately reflect your specific policies, terms, and business practices.

## Adding New Legal Pages

To add a new legal page:

1. Create a new directory under `/app/legal/`
2. Add a `page.tsx` file with the appropriate content
3. Update the main index page (`/app/legal/page.tsx`) to include a link to the new page 