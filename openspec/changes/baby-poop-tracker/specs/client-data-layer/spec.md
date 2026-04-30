## ADDED Requirements

### Requirement: API request layer
The system SHALL provide a centralized API request module that handles auth headers, error handling, and token expiration.

#### Scenario: Send authenticated request
- **WHEN** any API request is made
- **THEN** the request SHALL include `Authorization: Bearer <token>` header from stored token

#### Scenario: Handle token expiration
- **WHEN** API returns 401 status code
- **THEN** system SHALL clear stored token and redirect to config page

#### Scenario: Handle network failure
- **WHEN** request fails due to network error
- **THEN** system SHALL throw meaningful error message

### Requirement: Auth state management
The system SHALL manage authentication state with Pinia and persist token.

#### Scenario: Store login credentials
- **WHEN** user successfully connects to server
- **THEN** system SHALL persist token, server URL, and operator name to local storage

#### Scenario: Restore session on app start
- **WHEN** app opens with stored token
- **THEN** system SHALL verify token validity and auto-navigate to home page if valid

### Requirement: Record state management
The system SHALL manage records state with Pinia, including both synced and local-only records.

#### Scenario: Add record offline
- **WHEN** user creates a record while offline
- **THEN** system SHALL save to `localRecords` with a generated `localId` and `isLocal: true`

#### Scenario: Merge synced records
- **WHEN** sync completes and local records get server IDs
- **THEN** system SHALL update `isLocal` to `false` and set the server `id`

#### Scenario: Sort records chronologically
- **WHEN** displaying records list
- **THEN** system SHALL merge `records` and `localRecords`, filter deleted, sort by timestamp descending

### Requirement: Sync engine
The system SHALL provide an automatic sync service that pushes local changes and pulls server updates.

#### Scenario: Start auto sync
- **WHEN** user connects to server
- **THEN** system SHALL start 30-second interval sync

#### Scenario: Push local changes during sync
- **WHEN** sync cycle runs and local records exist
- **THEN** system SHALL push them to server and update local IDs from server response

#### Scenario: Pull server changes during sync
- **WHEN** sync cycle runs
- **THEN** system SHALL pull records updated since last sync and merge them locally

#### Scenario: Update sync status
- **WHEN** sync starts / succeeds / fails
- **THEN** system SHALL update sync status to syncing / synced / error

### Requirement: Baby state management
The system SHALL manage baby selection and listing state.

#### Scenario: Switch active baby
- **WHEN** user selects a different baby
- **THEN** system SHALL update active baby ID and refresh data for that baby

#### Scenario: Persist baby data
- **WHEN** babies are fetched or created
- **THEN** system SHALL persist baby list locally for offline access

### Requirement: Settings state management
The system SHALL persist user preferences including font size and theme.

#### Scenario: Change font size
- **WHEN** user changes font size setting
- **THEN** system SHALL persist the scale factor and apply it globally

#### Scenario: Toggle dark mode
- **WHEN** user toggles dark mode
- **THEN** system SHALL persist the preference and apply theme globally
