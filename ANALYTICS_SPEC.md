# Analytics Event Specification

This document outlines the Segment analytics events tracked within the Estate application, including their triggers and associated properties. All user IDs included in event payloads are anonymized to ensure data privacy.

## Frontend Events

These events are tracked from the Next.js frontend application (`apps/frontend`).

### 1. Page Viewed

*   **Description**: Tracks every page load within the application.
*   **Trigger**: Occurs on every page navigation.
*   **Segment Method**: `analytics.page()`
*   **Properties**: Segment automatically captures standard page properties such as `path`, `url`, `title`, `referrer`, etc.

### 2. User Identified

*   **Description**: Identifies a user with Segment when they sign in.
*   **Trigger**: Upon successful user sign-in (via email/password or OAuth).
*   **Segment Method**: `analytics.identify()`
*   **Properties**:
    *   `userId`: Anonymized unique identifier for the user.

### 3. Report Opened

*   **Description**: Tracks when a user accesses the reports page.
*   **Trigger**: When a user navigates to the `/reports` page.
*   **Segment Method**: `analytics.track('Report Opened')`
*   **Properties**: None explicitly added, but Segment will attach contextual properties.

### 4. Product Search

*   **Description**: Tracks when a user performs a search operation.
*   **Trigger**: When the search button is clicked on the `/search` page.
*   **Segment Method**: `analytics.track('Product Search', properties)`
*   **Properties**:
    *   `district` (string, optional): The district entered in the search filter.
    *   `neighborhood` (string, optional): The neighborhood entered in the search filter.
    *   `subwayLine` (string, optional): The subway line entered in the search filter.
    *   `yearBuilt` (number, optional): The year built entered in the search filter.
    *   `minPrice` (number, optional): The minimum price entered in the search filter.
    *   `maxPrice` (number, optional): The maximum price entered in the search filter.

## Backend Events

These events are tracked from the Node.js backend application (`apps/backend`).

### 1. User Signed Up

*   **Description**: Tracks when a new user successfully registers for an account.
*   **Trigger**: Upon successful completion of the user signup process.
*   **Segment Method**: `analytics.track('User Signed Up', properties)`
*   **Properties**:
    *   `userId`: Anonymized unique identifier for the newly signed-up user.

### 2. User Logged In

*   **Description**: Tracks when an existing user successfully logs into their account.
*   **Trigger**: Upon successful user login.
*   **Segment Method**: `analytics.track('User Logged In', properties)`
*   **Properties**:
    *   `userId`: Anonymized unique identifier for the logged-in user.
