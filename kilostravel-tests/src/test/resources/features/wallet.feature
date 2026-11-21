@WalletTests
Feature: Wallet Management
  As an authenticated AirWeight user
  I want to view my wallet balance and transfer credits to other users
  So that I can manage my baggage credits effectively

  Background:
    Given the user is logged in to KilosTravel

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 1 — VALID: Wallet balance is displayed and is non-negative
  # The wallet GET /api/v1/wallet response always returns balance_kg ≥ 0
  # ──────────────────────────────────────────────────────────────────────────

  @WalletBalance_Valid
  Scenario: Wallet balance is visible and non-negative
    When the user navigates to the Wallet page
    Then the wallet balance should be displayed
    And the wallet balance should be greater than or equal to zero

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 2 — VALID: Transfer modal opens and closes correctly
  # ──────────────────────────────────────────────────────────────────────────

  @TransferModal_OpenClose
  Scenario: Transfer modal opens and can be dismissed with Cancel
    When the user navigates to the Wallet page
    And the user clicks the Transfer Credits button
    Then the transfer modal should be visible
    When the user clicks Cancel in the transfer modal
    Then the transfer modal should be closed

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 3 — INVALID: Invalid email format blocked by HTML5 validation
  # input[type="email"] with required attribute — browser prevents submission
  # ──────────────────────────────────────────────────────────────────────────

  @Transfer_InvalidEmail
  Scenario Outline: Transfer is blocked when recipient email is not a valid address
    When the user navigates to the Wallet page
    And the user clicks the Transfer Credits button
    Then the transfer modal should be visible
    When the user enters "<invalidEmail>" as recipient email in the transfer modal
    And the user enters "1" as transfer amount
    And the user submits the transfer form
    Then the email validation error should prevent the transfer

    Examples:
      | invalidEmail    |
      | notanemail      |
      | missing@dot     |
      | @nodomain.com   |

  # ──────────────────────────────────────────────────────────────────────────
  # SCENARIO 4 — INVALID: Amount = 0 blocked by HTML5 min="0.1" validation
  # ──────────────────────────────────────────────────────────────────────────

  @Transfer_ZeroAmount
  Scenario: Transfer is blocked when amount is zero
    When the user navigates to the Wallet page
    And the user clicks the Transfer Credits button
    Then the transfer modal should be visible
    When the user enters "valid@example.com" as recipient email in the transfer modal
    And the user enters "0" as transfer amount
    And the user submits the transfer form
    Then the amount validation error should prevent the transfer
