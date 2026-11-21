@LoginTests
Feature: User Authentication
  As a registered AirWeight user
  I want to log in with my credentials
  So that I can access my flights and wallet

  # ──────────────────────────────────────────────────────────────────────────
  # VALID CASES
  # ──────────────────────────────────────────────────────────────────────────

  @Login_Valid
  Scenario Outline: Successful login with valid credentials
    Given the user is on the login page
    When the user enters email "<email>" and password "<password>"
    And the user clicks the login button
    Then the user should be redirected to the dashboard

    Examples:
      | email             | password |
      | test@airweight.io | Test123! |

  # ──────────────────────────────────────────────────────────────────────────
  # INVALID CASES
  # ──────────────────────────────────────────────────────────────────────────

  @Login_WrongPassword
  Scenario Outline: Login fails when the password is incorrect
    Given the user is on the login page
    When the user enters email "<email>" and password "<password>"
    And the user clicks the login button
    Then an error message should be displayed

    Examples:
      | email             | password         |
      | test@airweight.io | WrongPassword999 |

  @Login_UnknownEmail
  Scenario Outline: Login fails when the email does not exist
    Given the user is on the login page
    When the user enters email "<email>" and password "<password>"
    And the user clicks the login button
    Then an error message should be displayed

    Examples:
      | email                       | password |
      | does.not.exist@example.com  | Test123! |
