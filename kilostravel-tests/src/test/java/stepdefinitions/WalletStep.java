package stepdefinitions;

import com.aventstack.extentreports.Status;
import hooks.Hooks;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import pages.WalletPage;

/**
 * Step definitions for Wallet Management scenarios.
 *
 * Covers:
 *  - Wallet balance display and validity
 *  - Transfer Credits modal (open, cancel, submit)
 *  - HTML5 validation for invalid inputs
 */
public class WalletStep {

    private final WalletPage walletPage = new WalletPage();

    // ── Navigation ─────────────────────────────────────────────────────────────

    @When("the user navigates to the Wallet page")
    public void theUserNavigatesToWallet() {
        try {
            walletPage.navigateToWallet();
            Hooks._scenario.log(Status.PASS, "Navigated to /wallet");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not navigate to Wallet: " + e.getMessage());
            throw e;
        }
    }

    // ── Balance assertions ─────────────────────────────────────────────────────

    @Then("the wallet balance should be displayed")
    public void theWalletBalanceShouldBeDisplayed() {
        try {
            String balanceText = walletPage.getWalletBalanceText();
            Assert.assertFalse(
                    "Expected wallet balance text to be non-empty",
                    balanceText.isEmpty()
            );
            Hooks._scenario.log(Status.PASS,
                    "Wallet balance displayed: \"" + balanceText + "\"");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Wallet balance not displayed: " + e.getMessage());
            throw e;
        }
    }

    @Then("the wallet balance should be greater than or equal to zero")
    public void theWalletBalanceShouldBeNonNegative() {
        try {
            double balance = walletPage.getWalletBalanceValue();
            Assert.assertTrue(
                    "Wallet balance must be ≥ 0 but was: " + balance,
                    walletPage.isBalanceNonNegative()
            );
            Hooks._scenario.log(Status.PASS,
                    "Wallet balance is non-negative: " + balance + " kg");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Wallet balance is negative: " + e.getMessage());
            throw e;
        }
    }

    // ── Transfer modal ─────────────────────────────────────────────────────────

    @And("the user clicks the Transfer Credits button")
    public void theUserClicksTransferCredits() {
        try {
            walletPage.clickTransferCreditsButton();
            Hooks._scenario.log(Status.PASS, "Clicked Transfer Credits — modal opened");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Transfer Credits: " + e.getMessage());
            throw e;
        }
    }

    @Then("the transfer modal should be visible")
    public void theTransferModalShouldBeVisible() {
        try {
            Assert.assertTrue(
                    "Expected the transfer modal to be visible",
                    walletPage.isTransferModalVisible()
            );
            Hooks._scenario.log(Status.PASS, "Transfer modal is visible");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Transfer modal not visible: " + e.getMessage());
            throw e;
        }
    }

    @Then("the transfer modal should be closed")
    public void theTransferModalShouldBeClosed() {
        try {
            Assert.assertTrue(
                    "Expected the transfer modal to be closed",
                    walletPage.isTransferModalClosed()
            );
            Hooks._scenario.log(Status.PASS, "Transfer modal is closed");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Transfer modal is still open: " + e.getMessage());
            throw e;
        }
    }

    @When("the user clicks Cancel in the transfer modal")
    public void theUserClicksCancelInModal() {
        try {
            walletPage.clickCancelInModal();
            Hooks._scenario.log(Status.PASS, "Clicked Cancel in transfer modal");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not click Cancel: " + e.getMessage());
            throw e;
        }
    }

    @When("the user enters {string} as recipient email in the transfer modal")
    public void theUserEntersRecipientEmail(String email) {
        try {
            walletPage.enterRecipientEmail(email);
            Hooks._scenario.log(Status.INFO, "Recipient email entered: " + email);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter recipient email: " + e.getMessage());
            throw e;
        }
    }

    @And("the user enters {string} as transfer amount")
    public void theUserEntersTransferAmount(String amount) {
        try {
            walletPage.enterTransferAmount(amount);
            Hooks._scenario.log(Status.INFO, "Transfer amount entered: " + amount);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not enter transfer amount: " + e.getMessage());
            throw e;
        }
    }

    @And("the user submits the transfer form")
    public void theUserSubmitsTransferForm() {
        try {
            walletPage.clickSubmitTransfer();
            Hooks._scenario.log(Status.INFO, "Clicked Transfer submit button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Could not submit transfer form: " + e.getMessage());
            throw e;
        }
    }

    /**
     * HTML5 input[type="email"] with required attribute prevents submission
     * when the value is not a valid email — the browser shows a native validation
     * tooltip and the form is NOT submitted.
     * We verify the modal is still open (transfer was blocked).
     */
    @Then("the email validation error should prevent the transfer")
    public void emailValidationShouldPreventTransfer() {
        try {
            // If HTML5 validation blocked submission the modal stays open
            Assert.assertTrue(
                    "Expected transfer to be blocked by email validation "
                            + "(modal should remain visible)",
                    walletPage.isTransferModalVisible()
            );
            Hooks._scenario.log(Status.PASS,
                    "Email validation prevented the transfer — modal still open");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Email validation did not block transfer: " + e.getMessage());
            throw e;
        }
    }

    /**
     * HTML5 input[type="number"] with min="0.1" prevents submission when value is 0.
     * We verify the modal is still open (transfer was blocked).
     */
    @Then("the amount validation error should prevent the transfer")
    public void amountValidationShouldPreventTransfer() {
        try {
            // If HTML5 min validation blocked submission the modal stays open
            Assert.assertTrue(
                    "Expected transfer to be blocked by amount validation "
                            + "(modal should remain visible)",
                    walletPage.isTransferModalVisible()
            );
            Hooks._scenario.log(Status.PASS,
                    "Amount validation prevented the transfer — modal still open");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL,
                    "Amount validation did not block transfer: " + e.getMessage());
            throw e;
        }
    }
}
