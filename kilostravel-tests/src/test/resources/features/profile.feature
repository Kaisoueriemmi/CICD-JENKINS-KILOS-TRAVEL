@ProfileTests
Feature: User Profile Management
  As an authenticated AirWeight user
  I want to view and edit my personal profile information
  So that my account details are accurate

  Background:
    Given the user is logged in to KilosTravel

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 1 — VALID: Entering edit mode enables the form fields
  # ──────────────────────────────────────────────────────────────────────────

  @Profile_EditModeEnabled
  Scenario: Clicking Modifier enables the profile form for editing
    When the user navigates to the Profile page
    Then the profile page should be displayed
    When the user clicks the Modifier button
    Then the profile form fields should be editable

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 2 — VALID: Updating the full name shows a success toast
  #
  # @KnownBug — handleSave() in profile/page.tsx is a mock (setTimeout).
  # It does NOT call the backend API. The toast fires unconditionally.
  # The real save endpoint (PUT /api/users/me) is commented out in the code.
  # ──────────────────────────────────────────────────────────────────────────

  @Profile_UpdateName_Valid @KnownBug
  Scenario Outline: Updating the full name fires a success confirmation
    When the user navigates to the Profile page
    And the user clicks the Modifier button
    And the user updates the full name to "<newName>"
    And the user clicks Sauvegarder
    Then a success toast should appear

    Examples:
      | newName         |
      | Kais Oueriemmi  |

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 3 — INVALID: Cancelling discards changes and disables edit mode
  # ──────────────────────────────────────────────────────────────────────────

  @Profile_Cancel_Discards
  Scenario: Clicking Annuler discards edits and returns to view mode
    When the user navigates to the Profile page
    And the user clicks the Modifier button
    And the user updates the full name to "TempName DoNotSave"
    And the user clicks Annuler
    Then the full name field should be disabled
    And the displayed name should not contain "TempName DoNotSave"

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 4 — INVALID: Email field is permanently read-only
  # The email input has disabled={true} unconditionally — it cannot be edited.
  # Changing email requires a backend flow (not yet implemented in the UI).
  # ──────────────────────────────────────────────────────────────────────────

  @Profile_EmailReadOnly
  Scenario: Email field is permanently disabled and cannot be edited
    When the user navigates to the Profile page
    Then the email field should be disabled
