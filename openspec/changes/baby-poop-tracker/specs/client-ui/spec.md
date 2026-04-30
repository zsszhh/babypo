## ADDED Requirements

### Requirement: Server config page
The system SHALL provide a configuration page for connecting to the family server.

#### Scenario: Enter server address and password
- **WHEN** user opens the app first time
- **THEN** system SHALL display form with server URL, password, and operator nickname fields

#### Scenario: Auto-fill history address
- **WHEN** user taps the server URL input
- **THEN** system SHALL show previously used addresses for quick selection

#### Scenario: Connect to server
- **WHEN** user fills all fields and taps connect button
- **THEN** system SHALL show loading state, authenticate with server, and navigate to home on success

#### Scenario: Connection failure feedback
- **WHEN** connection fails
- **THEN** system SHALL display clear error message via toast

### Requirement: Home timeline page
The system SHALL display records in a date-grouped timeline.

#### Scenario: Show records grouped by date
- **WHEN** user is on the home page
- **THEN** system SHALL display records grouped by date with date headers

#### Scenario: Display record card
- **WHEN** displaying a record
- **THEN** system SHALL show time, type icon, type name, color, amount, operator name, and note

#### Scenario: Pull-to-refresh
- **WHEN** user pulls down on the timeline
- **THEN** system SHALL trigger manual sync

#### Scenario: Long press context menu
- **WHEN** user long-presses a record card
- **THEN** system SHALL show popup menu with edit and delete options

#### Scenario: FAB add button
- **WHEN** user taps the floating action button
- **THEN** system SHALL navigate to add-record page

#### Scenario: Sync status indicator
- **WHEN** sync status changes
- **THEN** system SHALL display current sync status in the header area

#### Scenario: Baby switcher
- **WHEN** user taps the baby name in header
- **THEN** system SHALL show a picker to switch active baby

### Requirement: Add/edit record page
The system SHALL provide a form for creating and editing poop records.

#### Scenario: Type grid selector
- **WHEN** user is on the record form
- **THEN** system SHALL display Bristol Stool Type grid (7 types) with icons and labels, allow single selection with highlight

#### Scenario: Color picker
- **WHEN** user selects color
- **THEN** system SHALL show dropdown with color options (yellow, green, brown, black, red)

#### Scenario: Amount picker
- **WHEN** user selects amount
- **THEN** system SHALL show dropdown with amount options (small, medium, large)

#### Scenario: Date/time selector
- **WHEN** user taps the time field
- **THEN** system SHALL show date and time picker

#### Scenario: Note input
- **WHEN** user enters notes
- **THEN** system SHALL provide multi-line text input

#### Scenario: Save record
- **WHEN** user taps save button with valid data
- **THEN** system SHALL validate required fields (type, operatorName), save record, and navigate back to home

#### Scenario: Pre-fill edit form
- **WHEN** editing an existing record
- **THEN** system SHALL pre-fill all fields with existing record data

### Requirement: Statistics page
The system SHALL display data statistics with visual charts.

#### Scenario: Show summary cards
- **WHEN** user opens statistics page
- **THEN** system SHALL display total count and average per day for selected period

#### Scenario: Type distribution bar chart
- **WHEN** viewing statistics
- **THEN** system SHALL show horizontal bar chart of Bristol type distribution

#### Scenario: Color distribution bar chart
- **WHEN** viewing statistics
- **THEN** system SHALL show horizontal bar chart of color distribution

#### Scenario: Period selector
- **WHEN** user select statistics period
- **THEN** system SHALL provide 7-day / 30-day toggle

#### Scenario: Export button
- **WHEN** user taps export button
- **THEN** system SHALL show export format options (JSON / CSV)

#### Scenario: Empty state
- **WHEN** no records exist
- **THEN** system SHALL show helpful message and guidance instead of empty charts

### Requirement: Baby management page
The system SHALL support adding, editing, and switching between multiple babies.

#### Scenario: List all babies
- **WHEN** user opens baby management
- **THEN** system SHALL display list of all babies with name, birthdate, gender

#### Scenario: Add new baby
- **WHEN** user taps add baby button
- **THEN** system SHALL show form with name, birthdate, gender fields

#### Scenario: Edit baby info
- **WHEN** user taps edit on a baby
- **THEN** system SHALL allow editing name, birthdate, gender

### Requirement: Settings page
The system SHALL allow users to adjust application settings.

#### Scenario: Adjust font size
- **WHEN** user changes font size setting
- **THEN** system SHALL provide small / medium / large options

#### Scenario: Toggle dark mode
- **WHEN** user toggles dark mode
- **THEN** system SHALL switch between light and dark themes

#### Scenario: Show app version
- **WHEN** user views settings page
- **THEN** system SHALL display app version and build info
