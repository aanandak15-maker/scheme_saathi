# Scheme Saathi - AI for Bharat

Scheme Saathi is an AI-powered platform designed to help citizens, especially in rural India, discover and apply for government schemes they are eligible for. It utilizes a multi-agent AI system to analyze citizen profiles against scheme criteria.

## Project Structure

-   `backend/`: Node.js/Express server with TypeScript. Handles API requests, AI processing (Gemini/Sarvam), and database interactions.
-   `frontend/`: Next.js 14 application with Tailwind CSS and Shadcn UI. Provides the user interface for citizens and CSC VLEs.

## Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Supabase account (for database)
-   Google Cloud account (for Gemini API)

## Setup Instructions

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    -   Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    -   Fill in the required API keys and Database credentials in `.env`.

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000` (or the PORT specified in .env).

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    -   Copy `.env.example` to `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    -   Fill in the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3001`.

## Features

-   **Check Eligibility**: specific questions to determine scheme eligibility.
-   **Multi-Lingual Support**: verification and support for local languages.
-   **CSC Dashboard**: Dedicated dashboard for Village Level Entrepreneurs to manage citizen applications.
-   **AI-Driven Insights**: Explainable AI to tell citizens *why* they are eligible or not.

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
