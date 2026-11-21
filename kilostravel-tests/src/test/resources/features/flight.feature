@FlightTests
Feature: Flight Management
  As an authenticated AirWeight user
  I want to add a new flight through the 3-step form
  So that I can earn baggage credits for unused weight

  Background:
    Given the user is logged in to KilosTravel

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 1 — VALID: Add a complete flight and verify it appears in the list
  # ──────────────────────────────────────────────────────────────────────────

  @AddFlight_Valid
  Scenario Outline: Add a new flight with all valid data
    When the user navigates to the Add Flight page
    And the user fills in flight number as "<flightNumber>"
    And the user selects airline "<airline>"
    And the user fills in departure airport as "<departure>"
    And the user fills in arrival airport as "<arrival>"
    And the user fills in the travel date as "<date>"
    And the user clicks Suivant to proceed to step 2
    And the user fills in allowed weight as "<allowance>"
    And the user fills in actual weight as "<used>"
    And the user clicks Suivant to proceed to step 3
    And the user confirms the flight submission
    Then the user is redirected to the flights list
    And the flight "<flightNumber>" should be visible in the flights table

    Examples:
      | flightNumber | airline  | departure | arrival | date       | allowance | used |
      | TU123        | Tunisair | TUN       | CDG     | 2026-06-15 | 23        | 10   |

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 2 — INVALID: Missing flight number → validation error
  # When the user clicks "Suivant" on step 1 without a flight number, the JS
  # validation shows: "Veuillez remplir tous les champs obligatoires"
  # ──────────────────────────────────────────────────────────────────────────

  @AddFlight_MissingFlightNumber
  Scenario: Step 1 validation fails when flight number is missing
    When the user navigates to the Add Flight page
    And the user leaves the flight number empty
    And the user selects airline "Tunisair"
    And the user fills in departure airport as "TUN"
    And the user fills in arrival airport as "CDG"
    And the user fills in the travel date as "2026-06-15"
    And the user clicks Suivant to proceed to step 2
    Then an error toast should appear with message containing "obligatoires"

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 3 — INVALID: Missing airline selection → validation error
  # The JS checks for airline truthy value before advancing to step 2.
  # ──────────────────────────────────────────────────────────────────────────

  @AddFlight_MissingAirline
  Scenario: Step 1 validation fails when airline is not selected
    When the user navigates to the Add Flight page
    And the user fills in flight number as "TU999"
    And the user leaves the airline unselected
    And the user fills in departure airport as "TUN"
    And the user fills in arrival airport as "CDG"
    And the user fills in the travel date as "2026-06-15"
    And the user clicks Suivant to proceed to step 2
    Then an error toast should appear with message containing "obligatoires"
