# StudyTeknik Frontend

## Project Description
This is the frontend application for **StudyTeknik**, a platform designed to help students structure their studies. The application includes features for:
- **Profile Management**: View and manage student profile.
- **Study Diary**: Create, read, update, and delete diary entries.
- **AI Support**: Get help rewriting texts via AI services (through the backend).
- **Flashcards**: Create and practice with flashcards (located in `src/app/decks`).

The project is built with modern web technologies to offer a responsive and fast user experience.

## Architecture Overview
The system consists of a decoupled frontend and backend.

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript / React 19
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Authentication**: Integrated with [Logto](https://logto.io/) (OIDC/OAuth2).
- **State Management**: React Server Components & Server Actions for data fetching.

### Backend (Separate Project)
- **Technology**: .NET / C# Web API.
- **URL**: `https://localhost:44317` (default for local development).
- **API Documentation**: Swagger UI (`/swagger/index.html`).

## Getting Started

### 1. Prerequisites
- **Node.js**: Version 20 or higher.
- **Backend**: The corresponding .NET project must be running locally.

### 2. Start Backend
1. Open the backend solution in Visual Studio or Rider.
2. Ensure the database is configured in `appsettings.json`.
3. Run the project with the **HTTPS** profile.
4. Verify that Swagger is running at `https://localhost:44317/swagger`.

### 3. Start Frontend
1. Navigate to the frontend directory in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Note: This command sets `NODE_TLS_REJECT_UNAUTHORIZED=0` to allow self-signed certificates locally.*

4. Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Endpoints List
Here is an overview of key API calls the frontend makes to the backend. See the backend code or Swagger for full definitions.

### Student / Profile
- `GET /students/student/general` (or `/profile/Get-My-Profile` depending on backend version)
  - Fetches logged-in student's profile information.

### Diary
- `GET /api/diary/GetAllDiariesForStudent`
  - Fetches all diary entries for the student.
- `POST /api/diary/CreateDiary`
  - Creates a new entry. Body: `{ text, entryDate }`.
- `PUT /api/diary/UpdateDiary/{id}`
  - Updates an existing entry.
- `DELETE /api/diary/DeleteDiary/{id}`
  - Deletes an entry.

### AI Services
- `POST /api/ai/rewrite`
  - Takes a text and returns an AI-rewritten version.

---

## Known Bugs / Issues
1. **Self-Signed Certificates**: 
   - Since the backend runs locally with a self-signed certificate (https), calls from Node.js (Server Components) might fail unless SSL verification is disabled. This is handled in the `package.json` `dev` script, but might occur if running `npm start` or in other environments without corresponding configuration.
2. **Authentication (401/403)**:
   - If you receive "Unauthorized" or "Forbidden", check that your Logto user has the correct **Role** assigned and that `src/app/logto.ts` requests the correct scopes and resources (`api://studyteknik`).
