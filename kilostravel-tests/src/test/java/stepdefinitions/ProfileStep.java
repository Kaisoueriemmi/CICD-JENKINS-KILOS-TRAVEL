package stepdefinitions;

import com.aventstack.extentreports.Status;
import hooks.Hooks;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pages.ProfilePage;

/**
 * Step definitions for User Profile Management scenarios.
 *
 * The profile page at /profile has two modes:
 *  - View mode  — fields disabled, "Modifier" button shown
 *  - Edit mode  — fields enabled, "Sauvegarder" + "Annuler" shown
 *
 * Known Issue: handleSave() calls a mock setTimeout() — not a real API call.
 * The success toast fires regardless. This is documented as @KnownBug in profile.feature.
 */
public class ProfileStep {

    private final ProfilePage profilePage = new ProfilePage();

    // ── Navigation ─────────────────────────────────────────────────────────────

    @When("the user navigates to the Profile page")
    public void theUserNavigatesToProfile() {
        try {
            profilePage.navigateToProfile();
            Hooks._scenario.log(Status.PASS, "Navigated to /profile");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not navigate to Profile: " + e.getMessage());
            throw e;
        }
    }

    @Then("the profile page should be displayed")
    public void theProfilePageShouldBeDisplayed() {
        try {
            Assert.assertTrue(
                    "Expected profile page to be visible",
                    profilePage.isProfilePageVisible()
            );
            Hooks._scenario.log(Status.PASS, "Profile page is displayed");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Profile page not visible: " + e.getMessage());
            throw e;
        }
    }

    // ── Edit mode ──────────────────────────────────────────────────────────────

    @When("the user clicks the Modifier button")
    public void theUserClicksModifier() {
        try {
            profilePage.clickEdit();
            Hooks._scenario.log(Status.PASS,
                    "Clicked Modifier — profile is now in edit mode");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Modifier: " + e.getMessage());
            throw e;
        }
    }

    @Then("the profile form fields should be editable")
    public void theProfileFormFieldsShouldBeEditable() {
        try {
            Assert.assertFalse(
                    "Expected full-name field to be enabled in edit mode",
                    profilePage.isFullNameFieldDisabled()
            );
            Hooks._scenario.log(Status.PASS,
                    "Full-name field is enabled — edit mode confirmed");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Profile fields not editable: " + e.getMessage());
            throw e;
        }
    }

    @And("the user updates the full name to {string}")
    public void theUserUpdatesFullName(String newName) {
        try {
            profilePage.updateFullName(newName);
            Hooks._scenario.log(Status.INFO, "Full name updated to: " + newName);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not update full name: " + e.getMessage());
            throw e;
        }
    }

    @And("the user clicks Sauvegarder")
    public void theUserClicksSauvegarder() {
        try {
            profilePage.clickSave();
            Hooks._scenario.log(Status.PASS, "Clicked Sauvegarder (save)");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Sauvegarder: " + e.getMessage());
            throw e;
        }
    }

    @Then("a success toast should appear")
    public void aSuccessToastShouldAppear() {
        try {
            Assert.assertTrue(
                    "Expected a success toast notification",
                    profilePage.isSuccessToastVisible()
            );
            String msg = profilePage.getSuccessToastMessage();
            Hooks._scenario.log(Status.PASS,
                    "Success toast appeared: \"" + msg + "\"");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Success toast not visible: " + e.getMessage());
            throw e;
        }
    }

    // ── Cancel ─────────────────────────────────────────────────────────────────

    @And("the user clicks Annuler")
    public void theUserClicksAnnuler() {
        try {
            profilePage.clickCancel();
            Hooks._scenario.log(Status.PASS,
                    "Clicked Annuler — edit mode cancelled");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Annuler: " + e.getMessage());
            throw e;
        }
    }

    @Then("the full name field should be disabled")
    public void theFullNameFieldShouldBeDisabled() {
        try {
            Assert.assertTrue(
                    "Expected full-name field to be disabled (view mode)",
                    profilePage.isFullNameFieldDisabled()
            );
            Hooks._scenario.log(Status.PASS,
                    "Full-name field is disabled — view mode confirmed");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Full-name field is still enabled: " + e.getMessage());
            throw e;
        }
    }

    @And("the displayed name should not contain {string}")
    public void theDisplayedNameShouldNotContain(String name) {
        try {
            String currentValue = profilePage.getFullNameValue();
            Assert.assertFalse(
                    "Expected name field NOT to contain \"" + name
                            + "\" after cancel but was: \"" + currentValue + "\"",
                    currentValue != null && currentValue.contains(name)
            );
            Hooks._scenario.log(Status.PASS,
                    "Name field does not contain \"" + name + "\" — cancel worked");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Name field still contains unexpected value: " + e.getMessage());
            throw e;
        }
    }

    // ── Email field ────────────────────────────────────────────────────────────

    @Then("the email field should be disabled")
    public void theEmailFieldShouldBeDisabled() {
        try {
            Assert.assertTrue(
                    "Expected email field to be permanently disabled",
                    profilePage.isEmailFieldDisabled()
            );
            Hooks._scenario.log(Status.PASS,
                    "Email field is disabled — cannot be edited (by design)");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Email field is not disabled: " + e.getMessage());
            throw e;
        }
    }
}
