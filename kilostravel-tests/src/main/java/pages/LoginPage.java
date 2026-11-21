package pages;

import base.TestBase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for /login
 *
 * Selectors use data-testid attributes added to the KilosTravel frontend
 * (see README — Frontend Modifications Required).
 *
 * Toast notifications use Sonner library internal attributes
 * (data-sonner-toast, data-type) since library internals cannot have testid added.
 */
public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // ── Selectors ──────────────────────────────────────────────────────────────

    // Tab buttons (data-testid added to frontend)
    private final By loginTab    = By.cssSelector("[data-testid='login-tab']");
    private final By registerTab = By.cssSelector("[data-testid='register-tab']");

    // Form fields (data-testid added to frontend)
    private final By emailInput    = By.cssSelector("[data-testid='email-input']");
    private final By passwordInput = By.cssSelector("[data-testid='password-input']");

    // Submit button (data-testid added to frontend)
    private final By loginBtn = By.cssSelector("[data-testid='login-btn']");

    // Post-login indicators
    // After login, Next.js redirects to /dashboard which loads the sticky Navbar
    private final By stickyNav = By.cssSelector("nav.sticky");

    // Sonner toast library uses these attributes for error/success feedback
    // These cannot receive data-testid (third-party component)
    private final By anyToast     = By.cssSelector("[data-sonner-toast]");
    private final By errorToast   = By.cssSelector("[data-sonner-toast][data-type='error']");
    private final By successToast = By.cssSelector("[data-sonner-toast][data-type='success']");

    // ── Constructor ────────────────────────────────────────────────────────────

    public LoginPage() {
        this.driver = TestBase.getDriver();
        this.wait   = TestBase.getWait();
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    public void openLoginPage() {
        driver.get(TestBase.getBaseUrl() + "/login");
        // EXPLICIT WAIT: login tab must be visible before any interaction
        wait.until(ExpectedConditions.visibilityOfElementLocated(loginTab));
    }

    public void ensureLoginTabActive() {
        // EXPLICIT WAIT: tab is clickable
        WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(loginTab));
        tab.click();
        // EXPLICIT WAIT: email field appears (indicates login form is shown)
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
    }

    // ── Form interactions ──────────────────────────────────────────────────────

    public void enterEmail(String email) {
        // EXPLICIT WAIT: field visible before typing
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        el.clear();
        el.sendKeys(email);
    }

    public void enterPassword(String password) {
        // EXPLICIT WAIT: field visible before typing
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        el.clear();
        el.sendKeys(password);
    }

    public void clickLoginButton() {
        // EXPLICIT WAIT: button must be clickable (not disabled/loading)
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(loginBtn));
        btn.click();
    }

    // ── Post-action assertions ─────────────────────────────────────────────────

    /**
     * Blocks until the browser has navigated to /dashboard and the Navbar is visible.
     * Call this after clickLoginButton() for a successful login.
     */
    public void waitForDashboard() {
        // EXPLICIT WAIT: URL must contain /dashboard after successful login
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        // EXPLICIT WAIT: sticky nav is rendered by ClientLayout on authenticated pages
        wait.until(ExpectedConditions.visibilityOfElementLocated(stickyNav));
    }

    public boolean isOnDashboard() {
        return driver.getCurrentUrl().contains("/dashboard");
    }

    /**
     * Returns the text of the first toast notification (error or success).
     */
    public String getToastMessage() {
        // EXPLICIT WAIT: toast appears after server response (login attempt)
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(anyToast));
        return toast.getText();
    }

    /**
     * Returns the text of an error toast specifically.
     */
    public String getErrorToastMessage() {
        // EXPLICIT WAIT: error toast appears after failed login
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(errorToast));
        return toast.getText();
    }

    /**
     * Returns true if an error toast is currently visible.
     */
    public boolean isErrorToastVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorToast)) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
