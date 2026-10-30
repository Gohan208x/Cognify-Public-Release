# Cognify

Cognify is a full-stack study platform designed to bring coursework, revision materials, past-year question papers, and collaboration into a single organized workspace. It combines structured academic management with targeted AI assistance to help students prepare for exams, understand complex subjects, test their knowledge, and resolve academic doubts.

---

## Why Cognify

College and university students typically find their study workflow fragmented across multiple tools: class notes saved in messaging groups, previous year question papers scattered across drives, YouTube video lectures in open tabs, and ad-hoc chat groups for doubts.

Cognify brings these pieces together into one cohesive environment:
- Syllabus-driven resource organisation so students always have the right textbook, notes, and previous year papers for each subject.
- Context-aware study tools that turn syllabus topics and lecture notes into structured summaries and self-test flashcard decks.
- A dedicated exam preparation module designed to break down long syllabi into prioritized revision chunks when time is limited.
- Peer discussion channels and doubt boards where students can ask questions, share answers, and collaborate.

---

## Key Features

### Resource Hub
- Centralized subject repositories organized by academic departments (IT, CSE, ECE, EEE, Mechanical, Civil).
- Direct access to lecture notes, compiled study guides, and past-year question papers (PYQs).
- Curated video lectures linked directly to corresponding courses.

### Smart Notes & Document Synthesis
- Generate structured, comprehensive study notes from lecture material and syllabus outlines.
- Analyze past-year exam questions alongside lecture notes to highlight frequently tested concepts and key formulas.
- Export notes directly to readable study formats.

### Panic Mode (Rapid Exam Revision)
- An accelerated revision module designed for tight deadlines.
- Automatically breaks down complex syllabi into bite-sized revision modules.
- Generates high-yield summaries, core concept breakdowns, and quick-check quizzes for each module.

### Study Arcade & Flashcard Decks
- Create, manage, and review flashcard decks organized by subject.
- Spaced repetition practice to reinforce active recall.
- Quiz mode for rapid self-assessment with instant feedback.

### Doubt Resolution Forum & Community
- Structured doubt panels where students can post questions, code snippets, and questions with image attachments.
- Community solution threads with accepted solutions and peer upvotes.
- Real-time presence indicators and subject-specific discussion channels.
- Direct peer messaging for collaborative study sessions.

### Study Planner & Productivity Tracking
- Weekly schedule planner to allocate study blocks and track assignment deadlines.
- Built-in Pomodoro timer with customizable focus and break intervals.
- Study session tracking with performance analytics to monitor daily and hourly productivity patterns.
- Gamified study streaks, daily challenges, and milestone badges to maintain consistency.

---

## Architecture & Technology Stack

Cognify is architected as a decoupled client-server application:

```
[ React 19 + TypeScript Frontend ]
             |
             | REST APIs (JSON / JWT)
             v
[ Spring Boot 3 Java Backend ]
       |                |
       v                v
[ PostgreSQL / H2 ]   [ Google Gemini API ]
```

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom theme extensions
- **Build Tool**: Vite
- **Icons & Markdown**: Lucide React, React Markdown

### Backend
- **Framework**: Spring Boot 3 (Java 17+)
- **Security**: Spring Security 6 with stateless JWT authentication and BCrypt password hashing
- **Persistence**: Spring Data JPA with Hibernate
- **Database**: 
  - Local development: File-backed H2 database for zero-configuration persistence
  - Production: PostgreSQL
- **AI Integration**: Google Gemini API client with automated model rotation to handle rate limits and service quotas

---

## Repository Structure

```
Cognify/
├── cognify-backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/java/com/cognify/
│   │   │   ├── config/              # Security, CORS, and Web MVC configuration
│   │   │   ├── controller/          # REST API controllers
│   │   │   ├── dto/                 # Request and response data transfer objects
│   │   │   ├── entity/              # JPA database models
│   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   └── service/             # Business logic and AI integration
│   │   └── main/resources/
│   │       ├── application.properties        # Default / local configuration
│   │       └── application-prod.properties   # Production configuration
│   ├── resources/                   # Course materials and sample syllabi
│   ├── Dockerfile                   # Backend Docker configuration
│   ├── mvnw / mvnw.cmd              # Maven wrapper scripts
│   └── pom.xml                      # Maven dependencies
│
├── components/                      # React UI components
│   ├── AdminPanel.tsx               # Administrative moderation panel
│   ├── Chat.tsx                     # Peer-to-peer messaging
│   ├── DoubtPanel.tsx               # Doubt forum and channels
│   ├── PanicMode.tsx                # Accelerated revision workflow
│   ├── Planner.tsx                  # Weekly schedule planner
│   ├── ResourceHub.tsx              # Subject material browser
│   ├── SmartNotes.tsx               # Notes synthesis interface
│   ├── StudyArcade.tsx              # Flashcard decks and quizzes
│   └── ...
│
├── services/                        # Service wrappers
├── src/                             # Frontend application core
│   ├── api/                         # Typed API client services
│   ├── context/                     # React Context providers (AuthContext)
│   ├── data/                        # Static datasets and shop configurations
│   └── hooks/                       # Custom React hooks
│
├── resources/                       # Static course materials (Notes, PYQs, Tags)
├── App.tsx                          # Root React view router
├── package.json                     # Frontend dependencies
├── render.yaml                      # Render deployment specification
└── vite.config.ts                   # Vite build configuration
```

---

## Getting Started

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18 or higher (with npm)
- **Git**

---

### 1. Backend Setup

Navigate to the `cognify-backend` directory:

```bash
cd cognify-backend
```

#### Configure Environment Variables (Optional for local development)
By default, the backend runs locally on port 8080 with a file-based H2 database stored under `./data/cognifydb`, meaning no external database installation is required for development.

To enable AI features, set your Google Gemini API key:

On Windows PowerShell:
```powershell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
```

On Linux or macOS:
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

#### Run the Backend

On Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

On Linux or macOS:
```bash
chmod +x ./mvnw
./mvnw spring-boot:run
```

The backend server will start at `http://localhost:8080`.

To verify the backend status, open `http://localhost:8080/api/health` in your browser.

---

### 2. Frontend Setup

Open a separate terminal window and navigate to the project root:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend application will start at `http://localhost:5173` (or `http://localhost:3000`).

---

## Configuration Reference

### Backend Variables

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | Port the Spring Boot application binds to |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key used for notes, flashcard generation, and doubt solving |
| `JWT_SECRET` | *(built-in development key)* | Base64 encoded secret key used for signing JWT tokens |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of permitted frontend origins |
| `SPRING_PROFILES_ACTIVE` | *(empty / default)* | Set to `prod` when deploying to production with PostgreSQL |
| `SPRING_DATASOURCE_URL` | *(H2 file path)* | JDBC URL for PostgreSQL when running in production |
| `SPRING_DATASOURCE_USERNAME`| `sa` | Database user |
| `SPRING_DATASOURCE_PASSWORD`| *(empty)* | Database password |

### Frontend Variables

Create a `.env` file in the root directory if you need to point the frontend to a remote backend:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Building for Production

### Frontend
```bash
npm run build
```
The compiled static assets will be output to the `dist/` folder, ready for deployment to static hosting platforms such as Vercel, Netlify, or AWS S3.

### Backend
```bash
cd cognify-backend
./mvnw clean package -DskipTests
```
The compiled runnable JAR file will be generated at `target/cognify-backend-2.0.0.jar`.

Run it with:
```bash
java -jar target/cognify-backend-2.0.0.jar
```

---

## Deployment

A `render.yaml` configuration is included at the repository root for one-click deployment of the backend and database to Render.

When deploying to production:
1. Set `SPRING_PROFILES_ACTIVE=prod` on the backend service.
2. Supply the database credentials via `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.
3. Set your secret keys (`JWT_SECRET` and `GEMINI_API_KEY`) through your hosting provider's secure environment variable settings.
4. Set `CORS_ALLOWED_ORIGINS` to the public domain of your deployed frontend.

---

## License

This project is open-source and available under the terms of the MIT License.

