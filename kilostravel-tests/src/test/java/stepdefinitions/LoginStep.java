package stepdefinitions;

import base.TestBase;
import com.aventstack.extentreports.Status;
import hooks.Hooks;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pages.LoginPage;

/**
 * Step definitions for authentication scenarios.
 *
 * The shared step "the user is logged in to KilosTravel" is defined here
 * and is automatically available to all features whose glue includes
 * "stepdefinitions" (configured in CucumberRunner).
 */
public class LoginStep {

    private final LoginPage loginPage = new LoginPage();

    // ── Shared login step (used by every feature as @Background or @Given) ─────

    @Given("the user is logged in to KilosTravel")
    public void theUserIsLoggedInToKilosTravel() {
        try {
            loginPage.openLoginPage();
            Hooks._scenario.log(Status.INFO, "Navigated to /login");

            loginPage.enterEmail(TestBase.getTestEmail());
            loginPage.enterPassword(TestBase.getTestPassword());
            loginPage.clickLoginButton();
            loginPage.waitForDashboard();

            Hooks._scenario.log(Status.PASS,
                    "Authenticated as: " + TestBase.getTestEmail());
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Login failed: " + e.getMessage());
            throw e;
        }
    }

    // ── Login-feature specific steps ───────────────────────────────────────────

    @Given("the user is on the login page")
    public void theUserIsOnTheLoginPage() {
        try {
            loginPage.openLoginPage();
            Hooks._scenario.log(Status.PASS, "Login page opened");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not open login page: " + e.getMessage());
            throw e;
        }
    }

    @When("the user enters email {string} and password {string}")
    public void theUserEntersEmailAndPassword(String email, String password) {
        try {
            loginPage.enterEmail(email);
            loginPage.enterPassword(password);
            Hooks._scenario.log(Status.INFO,
                    "Entered credentials — email: " + email);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter credentials: " + e.getMessage());
            throw e;
        }
    }

    @And("the user clicks the login button")
    public void theUserClicksTheLoginButton() {
        try {
            loginPage.clickLoginButton();
            Hooks._scenario.log(Status.PASS, "Clicked login button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click login button: " + e.getMessage());
            throw e;
        }
    }

    @Then("the user should be redirected to the dashboard")
    public void theUserShouldBeRedirectedToTheDashboard() {
        try {
            loginPage.waitForDashboard();
            Assert.assertTrue(
                    "Expected to be on the dashboard but URL was: "
                            + TestBase.getDriver().getCurrentUrl(),
                    loginPage.isOnDashboard()
            );
            Hooks._scenario.log(Status.PASS, "Redirected to dashboard successfully");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Dashboard redirect failed: " + e.getMessage());
            throw e;
        }
    }

    @Then("an error message should be displayed")
    public void anErrorMessageShouldBeDisplayed() {
        try {
            String message = loginPage.getErrorToastMessage();
            Assert.assertNotNull(
                    "Expected an error toast to be visible", message);
            Assert.assertFalse(
                    "Expected non-empty error message", message.trim().isEmpty());
            Hooks._scenario.log(Status.PASS,
                    "Error message displayed: \"" + message + "\"");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "No error message found: " + e.getMessage());
            throw e;
        }
    }
}
