package pages;

import base.TestBase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for /wallet
 *
 * Covers:
 *  - Balance display
 *  - Transfer Credits modal (open, fill, cancel, submit)
 *  - Recent transactions list
 *
 * All data-testid attributes were added to frontend/src/app/wallet/page.tsx.
 */
public class WalletPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // ── Main page selectors ────────────────────────────────────────────────────

    // Balance is displayed in a large <h2> element
    private final By walletBalance = By.cssSelector("[data-testid='wallet-balance']");

    // "Transfer Credits" button that opens the modal
    private final By transferBtn = By.cssSelector("[data-testid='transfer-btn']");

    // Page title — confirms we are on the wallet page
    private final By pageTitle = By.xpath("//h1[contains(text(),'Wallet') or contains(text(),'wallet')]");

    // Transaction rows (each rendered inside a .space-y-3 div)
    private final By transactionItems =
            By.cssSelector(".space-y-3 > div[class*='flex']");

    // ── Transfer modal selectors ───────────────────────────────────────────────

    // Modal container (data-testid added to the fixed overlay div)
    private final By transferModal = By.cssSelector("[data-testid='transfer-modal']");

    // Modal form fields
    private final By recipientEmailInput =
            By.cssSelector("[data-testid='recipient-email-input']");
    private final By amountInput =
            By.cssSelector("[data-testid='transfer-amount-input']");

    // Modal action buttons
    private final By cancelBtn   = By.cssSelector("[data-testid='transfer-cancel-btn']");
    private final By submitBtn   = By.cssSelector("[data-testid='transfer-submit-btn']");

    // ── Toast selectors (Sonner — third-party, no data-testid available) ──────
    private final By anyToast     = By.cssSelector("[data-sonner-toast]");
    private final By errorToast   = By.cssSelector("[data-sonner-toast][data-type='error']");
    private final By successToast = By.cssSelector("[data-sonner-toast][data-type='success']");

    // ── Constructor ────────────────────────────────────────────────────────────

    public WalletPage() {
        this.driver = TestBase.getDriver();
        this.wait   = TestBase.getWait();
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    public void navigateToWallet() {
        driver.get(TestBase.getBaseUrl() + "/wallet");
        // EXPLICIT WAIT: wallet balance element must be rendered
        // (page makes async API calls to populate data)
        wait.until(ExpectedConditions.visibilityOfElementLocated(walletBalance));
    }

    // ── Balance ────────────────────────────────────────────────────────────────

    /**
     * Returns the raw text of the wallet balance element, e.g. "13.0 kg".
     */
    public String getWalletBalanceText() {
        // EXPLICIT WAIT: balance is rendered after the API call completes
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(walletBalance));
        return el.getText().trim();
    }

    /**
     * Parses and returns the numeric balance value from the displayed text.
     * Text format: "13.0 kg" → returns 13.0
     */
    public double getWalletBalanceValue() {
        String text = getWalletBalanceText();
        // Strip everything except digits and the decimal separator
        String numeric = text.replaceAll("[^0-9.]", "");
        return numeric.isEmpty() ? 0.0 : Double.parseDouble(numeric);
    }

    /**
     * Returns true if the wallet balance is greater than or equal to zero.
     */
    public boolean isBalanceNonNegative() {
        return getWalletBalanceValue() >= 0.0;
    }

    // ── Transfer modal ─────────────────────────────────────────────────────────

    public void clickTransferCreditsButton() {
        // EXPLICIT WAIT: button must be clickable
        wait.until(ExpectedConditions.elementToBeClickable(transferBtn)).click();
        // EXPLICIT WAIT: modal overlay appears after click
        wait.until(ExpectedConditions.visibilityOfElementLocated(transferModal));
    }

    public boolean isTransferModalVisible() {
        try {
            // EXPLICIT WAIT: modal must be visible
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(transferModal)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTransferModalClosed() {
        try {
            // Check that the modal element is NOT present (returns true if absent)
            wait.until(ExpectedConditions.invisibilityOfElementLocated(transferModal));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void enterRecipientEmail(String email) {
        // EXPLICIT WAIT: email field in modal is visible
        WebElement el = wait.until(
                ExpectedConditions.visibilityOfElementLocated(recipientEmailInput));
        el.clear();
        el.sendKeys(email);
    }

    public void enterTransferAmount(String amount) {
        // EXPLICIT WAIT: amount field is visible
        WebElement el = wait.until(
                ExpectedConditions.visibilityOfElementLocated(amountInput));
        el.clear();
        el.sendKeys(amount);
    }

    public void clickCancelInModal() {
        // EXPLICIT WAIT: cancel button is clickable
        wait.until(ExpectedConditions.elementToBeClickable(cancelBtn)).click();
    }

    public void clickSubmitTransfer() {
        // EXPLICIT WAIT: submit button is clickable
        wait.until(ExpectedConditions.elementToBeClickable(submitBtn)).click();
    }

    // ── Transactions ───────────────────────────────────────────────────────────

    public int getTransactionCount() {
        try {
            // EXPLICIT WAIT: at least one transaction row is present
            wait.until(ExpectedConditions.presenceOfElementLocated(transactionItems));
            return driver.findElements(transactionItems).size();
        } catch (Exception e) {
            return 0;
        }
    }

    // ── Toast messages ─────────────────────────────────────────────────────────

    public String getToastMessage() {
        // EXPLICIT WAIT: any toast notification appears
        WebElement toast = wait.until(
                ExpectedConditions.visibilityOfElementLocated(anyToast));
        return toast.getText();
    }

    public String getErrorToastMessage() {
        // EXPLICIT WAIT: error toast from Sonner
        WebElement toast = wait.until(
                ExpectedConditions.visibilityOfElementLocated(errorToast));
        return toast.getText();
    }

    public boolean isErrorToastVisible() {
        try {
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(errorToast)) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
