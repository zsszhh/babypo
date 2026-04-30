## ADDED Requirements

### Requirement: Server authentication
The system SHALL provide JWT-based authentication using a shared family password.

#### Scenario: Successful login with correct password
- **WHEN** user sends POST `/api/v1/auth/login` with `{ "password": "<correct-password>" }`
- **THEN** system returns 200 with `{ "success": true, "data": { "token": "<jwt>", "expiresIn": 31536000 } }`

#### Scenario: Failed login with wrong password
- **WHEN** user sends POST `/api/v1/auth/login` with `{ "password": "<wrong-password>" }`
- **THEN** system returns 401 with `{ "success": false, "message": "密码错误" }`

#### Scenario: Verify valid token
- **WHEN** user sends POST `/api/v1/auth/verify` with valid Bearer token
- **THEN** system returns 200 with `{ "success": true, "data": { "valid": true } }`

### Requirement: Record CRUD
The system SHALL support full CRUD operations on poop records with soft delete.

#### Scenario: List records with pagination
- **WHEN** user sends GET `/api/v1/records?limit=20&offset=0&baby_id=1`
- **THEN** system returns 200 with `{ "success": true, "data": { "records": [...], "total": <count> } }`

#### Scenario: Create new record
- **WHEN** user sends POST `/api/v1/records` with valid record data
- **THEN** system returns 201 with created record and `id`

#### Scenario: Update existing record
- **WHEN** user sends PUT `/api/v1/records/:id` with updated fields
- **THEN** system returns 200 with `{ "success": true, "message": "记录更新成功" }`

#### Scenario: Soft delete a record
- **WHEN** user sends DELETE `/api/v1/records/:id`
- **THEN** system sets `is_deleted = 1` and returns 200 with `{ "success": true, "message": "记录删除成功" }`

#### Scenario: Get single record detail
- **WHEN** user sends GET `/api/v1/records/:id`
- **THEN** system returns 200 with full record object

#### Scenario: Filter records by date range
- **WHEN** user sends GET `/api/v1/records?start_date=1714204800000&end_date=1714291200000`
- **THEN** system returns records within that timestamp range

### Requirement: Offline sync
The system SHALL support push/pull sync for offline-first clients.

#### Scenario: Pull records since last sync
- **WHEN** user sends POST `/api/v1/sync/pull` with `{ "lastSyncTime": 1714204800000 }`
- **THEN** system returns records updated after that time, plus list of deleted IDs

#### Scenario: Push local changes
- **WHEN** user sends POST `/api/v1/sync/push` with array of locally created/updated records
- **THEN** system returns mapping of `localId` to `serverId`

### Requirement: Multi-baby management
The system SHALL support managing multiple babies.

#### Scenario: List all babies
- **WHEN** user sends GET `/api/v1/babies`
- **THEN** system returns array of all baby records

#### Scenario: Create new baby
- **WHEN** user sends POST `/api/v1/babies` with `{ "name": "宝宝", "birthdate": 1714204800000 }`
- **THEN** system returns 201 with created baby record

#### Scenario: Update baby info
- **WHEN** user sends PUT `/api/v1/babies/:id` with updated fields
- **THEN** system returns 200 with updated baby record

### Requirement: Data statistics
The system SHALL provide statistical summaries.

#### Scenario: Get summary statistics
- **WHEN** user sends GET `/api/v1/statistics/summary?days=7&baby_id=1`
- **THEN** system returns total count, average per day, type distribution, and color distribution

### Requirement: Data export
The system SHALL support exporting data in JSON and CSV formats.

#### Scenario: Export as JSON
- **WHEN** user sends GET `/api/v1/export/json`
- **THEN** system returns JSON file download

#### Scenario: Export as CSV
- **WHEN** user sends GET `/api/v1/export/csv`
- **THEN** system returns CSV file download

### Requirement: Unified response format
All API responses SHALL follow a unified JSON format.

#### Scenario: Success response format
- **WHEN** any API call succeeds
- **THEN** response SHALL include `{ "success": true, "data": <payload>, "message": "操作成功" }`

#### Scenario: Error response format
- **WHEN** any API call fails
- **THEN** response SHALL include `{ "success": false, "message": "<error-description>" }`
