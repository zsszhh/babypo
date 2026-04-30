## ADDED Requirements

### Requirement: Docker deployment
The system SHALL provide Docker-based deployment for the backend server.

#### Scenario: Build Docker image
- **WHEN** user runs `docker-compose build`
- **THEN** system SHALL build a Node.js 20 Alpine-based image with production dependencies only

#### Scenario: Start server with Docker Compose
- **WHEN** user runs `docker-compose up -d`
- **THEN** system SHALL start the server container, map port 3000, and mount data volume for persistence

#### Scenario: Environment configuration
- **WHEN** running in Docker
- **THEN** system SHALL read JWT_SECRET, PASSWORD, PORT from environment variables

#### Scenario: Data persistence
- **WHEN** container restarts
- **THEN** SQLite database file SHALL persist via Docker volume mount

### Requirement: Development setup
The system SHALL support local development without Docker.

#### Scenario: Install dependencies
- **WHEN** user runs `npm install` in server directory
- **THEN** system SHALL install all production and dev dependencies

#### Scenario: Development mode
- **WHEN** user runs `npm run dev`
- **THEN** system SHALL start server with nodemon for hot reload

#### Scenario: Production mode
- **WHEN** user runs `npm start`
- **THEN** system SHALL start the server in production mode

### Requirement: Security defaults
The deployment SHALL have secure defaults for production.

#### Scenario: Default JWT secret warning
- **WHEN** JWT_SECRET is the default value
- **THEN** system SHALL log a warning about changing it in production

#### Scenario: Helmet middleware
- **WHEN** server starts
- **THEN** system SHALL enable Helmet security headers
