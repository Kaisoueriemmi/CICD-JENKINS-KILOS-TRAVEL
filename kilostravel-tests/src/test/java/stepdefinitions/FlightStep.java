package stepdefinitions;

import com.aventstack.extentreports.Status;
import hooks.Hooks;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pages.FlightPage;

/**
 * Step definitions for Flight Management scenarios.
 *
 * Covers the 3-step Add Flight wizard:
 *   Step 1 — flight info
 *   Step 2 — baggage weights
 *   Step 3 — confirmation → POST /api/v1/flights
 */
public class FlightStep {

    private final FlightPage flightPage = new FlightPage();

    // ── Navigation ─────────────────────────────────────────────────────────────

    @When("the user navigates to the Add Flight page")
    public void theUserNavigatesToAddFlight() {
        try {
            flightPage.navigateToAddFlight();
            Hooks._scenario.log(Status.PASS, "Navigated to /flights/add");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not navigate to Add Flight: " + e.getMessage());
            throw e;
        }
    }

    // ── Step 1 steps ───────────────────────────────────────────────────────────

    @And("the user fills in flight number as {string}")
    public void theUserFillsInFlightNumber(String flightNumber) {
        try {
            flightPage.enterFlightNumber(flightNumber);
            Hooks._scenario.log(Status.INFO, "Flight number entered: " + flightNumber);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter flight number: " + e.getMessage());
            throw e;
        }
    }

    @And("the user leaves the flight number empty")
    public void theUserLeavesFlightNumberEmpty() {
        try {
            flightPage.clearFlightNumber();
            Hooks._scenario.log(Status.INFO, "Flight number field cleared (left empty)");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not clear flight number: " + e.getMessage());
            throw e;
        }
    }

    @And("the user selects airline {string}")
    public void theUserSelectsAirline(String airline) {
        try {
            flightPage.selectAirline(airline);
            Hooks._scenario.log(Status.INFO, "Airline selected: " + airline);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not select airline: " + e.getMessage());
            throw e;
        }
    }

    @And("the user leaves the airline unselected")
    public void theUserLeavesAirlineUnselected() {
        // No action needed — default value is empty ("Sélectionner...")
        Hooks._scenario.log(Status.INFO, "Airline left unselected (default empty option)");
    }

    @And("the user fills in departure airport as {string}")
    public void theUserFillsInDepartureAirport(String code) {
        try {
            flightPage.enterDepartureAirport(code);
            Hooks._scenario.log(Status.INFO, "Departure airport entered: " + code);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter departure airport: " + e.getMessage());
            throw e;
        }
    }

    @And("the user fills in arrival airport as {string}")
    public void theUserFillsInArrivalAirport(String code) {
        try {
            flightPage.enterArrivalAirport(code);
            Hooks._scenario.log(Status.INFO, "Arrival airport entered: " + code);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter arrival airport: " + e.getMessage());
            throw e;
        }
    }

    @And("the user fills in the travel date as {string}")
    public void theUserFillsInTravelDate(String date) {
        try {
            flightPage.enterFlightDate(date);
            Hooks._scenario.log(Status.INFO, "Flight date entered: " + date);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter flight date: " + e.getMessage());
            throw e;
        }
    }

    @And("the user clicks Suivant to proceed to step 2")
    public void theUserClicksSuivantToStep2() {
        try {
            flightPage.clickSuivantStep1();
            Hooks._scenario.log(Status.INFO,
                    "Clicked Suivant — attempting to advance to step 2");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Suivant: " + e.getMessage());
            throw e;
        }
    }

    // ── Step 2 steps ───────────────────────────────────────────────────────────

    @And("the user fills in allowed weight as {string}")
    public void theUserFillsInAllowedWeight(String kg) {
        try {
            flightPage.waitForStep2();
            flightPage.enterAllowedWeight(kg);
            Hooks._scenario.log(Status.INFO, "Allowed weight: " + kg + " kg");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter allowed weight: " + e.getMessage());
            throw e;
        }
    }

    @And("the user fills in actual weight as {string}")
    public void theUserFillsInActualWeight(String kg) {
        try {
            flightPage.enterActualWeight(kg);
            Hooks._scenario.log(Status.INFO, "Actual weight: " + kg + " kg");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter actual weight: " + e.getMessage());
            throw e;
        }
    }

    @And("the user clicks Suivant to proceed to step 3")
    public void theUserClicksSuivantToStep3() {
        try {
            flightPage.clickSuivantStep2();
            Hooks._scenario.log(Status.INFO,
                    "Clicked Suivant — advancing to step 3 (confirmation)");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Suivant on step 2: " + e.getMessage());
            throw e;
        }
    }

    // ── Step 3 steps ───────────────────────────────────────────────────────────

    @And("the user confirms the flight submission")
    public void theUserConfirmsFlightSubmission() {
        try {
            flightPage.waitForStep3();
            flightPage.clickConfirm();
            Hooks._scenario.log(Status.PASS,
                    "Clicked Confirmer — flight submission sent to API");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not confirm flight: " + e.getMessage());
            throw e;
        }
    }

    // ── Result assertions ──────────────────────────────────────────────────────

    @Then("the user is redirected to the flights list")
    public void theUserIsRedirectedToFlightsList() {
        try {
            flightPage.waitForRedirectToFlightsList();
            Hooks._scenario.log(Status.PASS, "Redirected to /flights list");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Redirect to flights list failed: " + e.getMessage());
            throw e;
        }
    }

    @Then("the flight {string} should be visible in the flights table")
    public void theFlightShouldBeInTable(String flightNumber) {
        try {
            boolean found = flightPage.isFlightInList(flightNumber);
            Assert.assertTrue(
                    "Flight \"" + flightNumber + "\" was not found in the flights table",
                    found
            );
            Hooks._scenario.log(Status.PASS,
                    "Flight \"" + flightNumber + "\" is visible in the flights table");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Flight not found in table: " + e.getMessage());
            throw e;
        }
    }

    @Then("an error toast should appear with message containing {string}")
    public void anErrorToastShouldContain(String expectedText) {
        try {
            Assert.assertTrue(
                    "Expected an error toast to be visible",
                    flightPage.isErrorToastVisible()
            );
            String actual = flightPage.getErrorToastMessage();
            Assert.assertTrue(
                    "Expected error message to contain \"" + expectedText
                            + "\" but was: \"" + actual + "\"",
                    actual.toLowerCase().contains(expectedText.toLowerCase())
            );
            Hooks._scenario.log(Status.PASS,
                    "Error toast displayed: \"" + actual + "\"");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Error toast assertion failed: " + e.getMessage());
            throw e;
        }
    }
}
