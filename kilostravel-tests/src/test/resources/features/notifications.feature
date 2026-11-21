@NotificationTests
Feature: Notification System
  As an authenticated AirWeight user
  I want to receive and manage notifications about my credits and activity
  So that I am always aware of important account events

  Background:
    Given the user is logged in to KilosTravel

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 1 — VALID: Notification bell toggles dropdown open and closed
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_BellToggle
  Scenario: Clicking the notification bell opens the dropdown
    When the user clicks the notification bell icon
    Then the notification dropdown should be visible

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 2 — VALID: Clicking the bell a second time closes the dropdown
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_BellCloses
  Scenario: Clicking the notification bell again closes the dropdown
    When the user clicks the notification bell icon
    Then the notification dropdown should be visible
    When the user clicks the notification bell icon
    Then the notification dropdown should not be visible

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 3 — VALID: Full notifications page loads with content or empty state
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_PageLoads
  Scenario: The full notifications page shows content or an empty state
    When the user navigates to the Notifications page
    Then the notifications page should be displayed
    And either notifications list or empty state should be visible

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 4 — VALID: Mark all notifications as read
  # POST /api/v1/notifications/mark-all-read — may show success toast or no-op
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_MarkAllRead
  Scenario: Clicking "Tout marquer comme lu" succeeds without error
    When the user navigates to the Notifications page
    And the user clicks Tout marquer comme lu
    Then a success toast or no error should occur

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 5 — INVALID (edge case): Empty state when no notifications exist
  # This is data-dependent. The step gracefully skips if account has items.
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_EmptyState
  Scenario: Empty-state message shown when there are no notifications
    When the user navigates to the Notifications page
    And there are no notifications
    Then the empty state message should be displayed

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 6 — INVALID (negative state): Dropdown must NOT be visible
  # before any user interaction with the bell icon. Guards against the UI
  # leaking an open dropdown on page load.
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_DropdownClosedByDefault
  Scenario: Notification dropdown is not visible by default before clicking the bell
    When the user lands on an authenticated page
    Then the notification dropdown should not be visible

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 7 — INVALID (unauthorised access): Without a valid session,
  # navigating directly to /notifications must redirect to /login.
  # ──────────────────────────────────────────────────────────────────────────

  @Notification_RequiresAuth
  Scenario: Navigating to /notifications without a session redirects to /login
    When the user clears the session
    And the user attempts to navigate directly to the Notifications page
    Then the user should be redirected to the login page
