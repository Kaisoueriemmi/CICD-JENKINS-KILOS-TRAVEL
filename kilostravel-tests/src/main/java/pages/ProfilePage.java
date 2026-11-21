package pages;

import base.TestBase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for /profile
 *
 * The profile form has two states:
 *  - View mode: all fields disabled, "Modifier" button visible
 *  - Edit mode: all fields enabled (except email), "Sauvegarder" + "Annuler" visible
 *
 * NOTE — Known Issue: handleSave() in profile/page.tsx is a mock simulation
 * (setTimeout 1000ms) that does NOT call the backend API. The success toast fires
 * regardless of what data is entered. Tests reflect this actual behaviour.
 *
 * data-testid attributes were added to frontend/src/app/profile/page.tsx.
 */
public class ProfilePage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // ── Selectors ──────────────────────────────────────────────────────────────

    // Page heading — confirms we are on the profile page
    private final By pageHeading = By.xpath(
            "//h1[contains(text(),'Mon Profil') or contains(text(),'Profil')]");

    // Buttons (data-testid added to frontend)
    private final By editBtn   = By.cssSelector("[data-testid='edit-btn']");
    private final By saveBtn   = By.cssSelector("[data-testid='save-btn']");
    private final By cancelBtn = By.cssSelector("[data-testid='cancel-btn']");

    // Form fields (data-testid added to frontend)
    private final By fullNameInput = By.cssSelector("[data-testid='full-name-input']");
    private final By emailInput    = By.cssSelector("[data-testid='email-input-profile']");

    // Toast notifications (Sonner — third-party)
    private final By successToast = By.cssSelector("[data-sonner-toast][data-type='success']");
    private final By errorToast   = By.cssSelector("[data-sonner-toast][data-type='error']");

    // ── Constructor ────────────────────────────────────────────────────────────

    public ProfilePage() {
        this.driver = TestBase.getDriver();
        this.wait   = TestBase.getWait();
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    public void navigateToProfile() {
        driver.get(TestBase.getBaseUrl() + "/profile");
        // EXPLICIT WAIT: page heading must be visible (page uses Zustand auth store)
        wait.until(ExpectedConditions.visibilityOfElementLocated(pageHeading));
    }

    // ── View-mode interactions ─────────────────────────────────────────────────

    /**
     * Clicks "Modifier" to enter edit mode.
     */
    public void clickEdit() {
        // EXPLICIT WAIT: edit button visible in view mode
        wait.until(ExpectedConditions.elementToBeClickable(editBtn)).click();
        // EXPLICIT WAIT: save button appears when edit mode is active
        wait.until(ExpectedConditions.visibilityOfElementLocated(saveBtn));
    }

    /**
     * Returns true if the profile page heading is displayed (page loaded).
     */
    public boolean isProfilePageVisible() {
        try {
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(pageHeading)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    // ── Edit-mode interactions ─────────────────────────────────────────────────

    public void updateFullName(String newName) {
        // EXPLICIT WAIT: name field enabled in edit mode
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(fullNameInput));
        el.clear();
        el.sendKeys(newName);
    }

    /**
     * Clicks "Sauvegarder" — triggers the (mocked) save operation.
     */
    public void clickSave() {
        // EXPLICIT WAIT: save button must be clickable (not disabled while loading)
        wait.until(ExpectedConditions.elementToBeClickable(saveBtn)).click();
    }

    /**
     * Clicks "Annuler" — discards changes and returns to view mode.
     */
    public void clickCancel() {
        // EXPLICIT WAIT: cancel button is clickable
        wait.until(ExpectedConditions.elementToBeClickable(cancelBtn)).click();
        // EXPLICIT WAIT: edit button reappears (view mode restored)
        wait.until(ExpectedConditions.visibilityOfElementLocated(editBtn));
    }

    // ── Field state inspection ─────────────────────────────────────────────────

    /**
     * Returns true if the full-name input is disabled (view mode).
     */
    public boolean isFullNameFieldDisabled() {
        // EXPLICIT WAIT: field must be visible to check its attribute
        WebElement el = wait.until(
                ExpectedConditions.presenceOfElementLocated(fullNameInput));
        return !el.isEnabled();
    }

    /**
     * Returns true if the email input is disabled (it is ALWAYS disabled by design).
     */
    public boolean isEmailFieldDisabled() {
        // EXPLICIT WAIT: email field is present
        WebElement el = wait.until(
                ExpectedConditions.presenceOfElementLocated(emailInput));
        return !el.isEnabled();
    }

    /**
     * Returns the current value of the full-name input.
     */
    public String getFullNameValue() {
        // EXPLICIT WAIT: field visible
        WebElement el = wait.until(
                ExpectedConditions.presenceOfElementLocated(fullNameInput));
        return el.getAttribute("value");
    }

    // ── Toast messages ─────────────────────────────────────────────────────────

    public String getSuccessToastMessage() {
        // EXPLICIT WAIT: success toast after save (even the mocked one)
        WebElement toast = wait.until(
                ExpectedConditions.visibilityOfElementLocated(successToast));
        return toast.getText();
    }

    public boolean isSuccessToastVisible() {
        try {
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(successToast)) != null;
        } catch (Exception e) {
            return false;
        }
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
