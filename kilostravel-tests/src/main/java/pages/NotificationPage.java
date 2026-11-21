package pages;

import base.TestBase;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

/**
 * Page Object for the Notification system:
 *  - NotificationBell component (in Navbar) → dropdown
 *  - /notifications full page
 *
 * The bell dropdown shows up to 5 notifications from the polling API call.
 * The full page shows up to 50, with "Toutes" / "Non lues" filters.
 *
 * "Marquer comme lu" and "Supprimer" buttons on the full page are hidden
 * behind CSS `opacity-0 group-hover:opacity-100` — Actions.moveToElement()
 * is used to trigger the hover before clicking.
 *
 * data-testid attributes were added to:
 *  - frontend/src/components/NotificationBell.tsx
 *  - frontend/src/app/notifications/page.tsx
 */
public class NotificationPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final Actions actions;

    // ── Navbar bell (available on every authenticated page) ────────────────────

    // data-testid="notification-bell" added to the bell <button>
    private final By bellButton = By.cssSelector("[data-testid='notification-bell']");

    // Unread count badge inside the bell button
    private final By unreadBadge = By.cssSelector("[data-testid='notification-bell'] span");

    // ── Bell dropdown ──────────────────────────────────────────────────────────

    // data-testid="notification-dropdown" added to the motion.div dropdown
    private final By dropdownPanel = By.cssSelector("[data-testid='notification-dropdown']");

    // "Aucune notification" empty state in the dropdown
    private final By dropdownEmpty = By.xpath(
            "//*[@data-testid='notification-dropdown']//*[contains(text(),'Aucune notification')]");

    // "Voir toutes les notifications →" link at the bottom of the dropdown
    private final By viewAllLink = By.xpath(
            "//a[contains(text(),'Voir toutes les notifications')]");

    // ── Full notifications page (/notifications) ───────────────────────────────

    // Page heading
    private final By pageHeading = By.xpath("//h1[contains(text(),'Notifications')]");

    // Notification items (data-testid="notification-item" added to each row)
    private final By notificationItems = By.cssSelector("[data-testid='notification-item']");

    // "Tout marquer comme lu" button (data-testid="mark-all-read-btn" added)
    private final By markAllReadBtn = By.cssSelector("[data-testid='mark-all-read-btn']");

    // Per-notification action buttons (visible on group-hover)
    // data-testid="mark-read-btn" and "delete-notification-btn" added
    private final By markReadBtns  = By.cssSelector("[data-testid='mark-read-btn']");
    private final By deleteBtns    = By.cssSelector("[data-testid='delete-notification-btn']");

    // Empty state on the full page (data-testid="empty-state" added)
    private final By emptyState = By.cssSelector("[data-testid='empty-state']");

    // Filter buttons
    private final By filterAll    = By.xpath("//button[normalize-space()='Toutes']");
    private final By filterUnread = By.xpath("//button[normalize-space()='Non lues']");

    // Toast (Sonner — third-party)
    private final By successToast = By.cssSelector("[data-sonner-toast][data-type='success']");
    // Any visible Sonner toast that could intercept clicks
    private final By anyVisibleToast = By.cssSelector("[data-sonner-toast]");

    // ── Constructor ────────────────────────────────────────────────────────────

    public NotificationPage() {
        this.driver  = TestBase.getDriver();
        this.wait    = TestBase.getWait();
        this.actions = new Actions(driver);
    }

    // ── Navbar bell ────────────────────────────────────────────────────────────

    /**
     * Clicks the notification bell icon in the Navbar.
     * Waits for any Sonner toasts (e.g. login success) to disappear first,
     * then uses JS executor to bypass any remaining overlay interception.
     */
    public void clickNotificationBell() {
        // Wait for any visible toasts to disappear before clicking the bell
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(anyVisibleToast));
        } catch (Exception ignored) {
            // No toast present or already gone — proceed
        }
        // Use JS click to bypass any lingering overlay
        WebElement bell = wait.until(ExpectedConditions.presenceOfElementLocated(bellButton));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", bell);
    }

    /**
     * Returns true if the notification dropdown is currently visible.
     */
    public boolean isDropdownVisible() {
        try {
            // EXPLICIT WAIT: dropdown panel appears after bell click
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(dropdownPanel)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns true if the dropdown is NOT visible (closed).
     */
    public boolean isDropdownClosed() {
        try {
            // EXPLICIT WAIT: dropdown must become invisible
            wait.until(ExpectedConditions.invisibilityOfElementLocated(dropdownPanel));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns the unread count shown on the bell badge.
     * Returns 0 if no badge is visible (no unread notifications).
     */
    public int getUnreadCount() {
        try {
            // EXPLICIT WAIT: badge may not be present if unread count is 0
            WebElement badge = wait.until(
                    ExpectedConditions.presenceOfElementLocated(unreadBadge));
            String text = badge.getText().trim().replace("+", "");
            return Integer.parseInt(text);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Returns true if the dropdown shows the "Aucune notification" empty state.
     */
    public boolean isDropdownShowingEmptyState() {
        try {
            // EXPLICIT WAIT: empty state text is visible in the dropdown
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(dropdownEmpty)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    // ── Full notifications page ────────────────────────────────────────────────

    public void navigateToNotificationsPage() {
        driver.get(TestBase.getBaseUrl() + "/notifications");
        // EXPLICIT WAIT: page heading must be visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(pageHeading));
    }

    /**
     * Navigates directly to /notifications without waiting for the page heading.
     * Used by negative scenarios where we expect a redirect (e.g. unauthenticated
     * access redirects to /login).
     */
    public void navigateToNotificationsPageNoWait() {
        driver.get(TestBase.getBaseUrl() + "/notifications");
    }

    /**
     * Navigates to the dashboard (an authenticated page that hosts the Navbar bell).
     * Used by negative scenarios that need an authenticated context but no
     * notification-specific page.
     */
    public void navigateToDashboard() {
        // The login step already lands on /dashboard.
        // Re-navigating triggers a Zustand rehydration race that redirects to /login
        // before the auth state is restored — so we just wait for the bell in-place.
        wait.until(ExpectedConditions.presenceOfElementLocated(bellButton));
    }

    /**
     * Returns true if the dropdown panel is NOT present in the DOM at all.
     * Distinct from isDropdownClosed() which waits for invisibility transition —
     * this is a hard "never opened" check.
     */
    public boolean isDropdownNotPresent() {
        return driver.findElements(dropdownPanel).isEmpty();
    }

    /**
     * Clears all browser cookies and local/session storage to simulate a logout.
     * Used by negative scenarios that test unauthenticated access redirects.
     */
    public void clearSession() {
        driver.manage().deleteAllCookies();
        try {
            ((JavascriptExecutor) driver).executeScript(
                    "window.localStorage.clear(); window.sessionStorage.clear();");
        } catch (Exception ignored) {
            // localStorage may be inaccessible on some pages — best-effort
        }
    }

    /**
     * Returns true if the browser has been redirected to /login.
     * EXPLICIT WAIT: URL must contain /login.
     */
    public boolean isOnLoginPage() {
        try {
            wait.until(ExpectedConditions.urlContains("/login"));
            return driver.getCurrentUrl().contains("/login");
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isNotificationsPageVisible() {
        try {
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(pageHeading)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns the number of notification items currently displayed on the full page.
     */
    public int getNotificationItemCount() {
        try {
            // Wait a moment for the API response to render
            // EXPLICIT WAIT: at least one item OR the empty state must be present
            wait.until(ExpectedConditions.or(
                    ExpectedConditions.presenceOfElementLocated(notificationItems),
                    ExpectedConditions.presenceOfElementLocated(emptyState)
            ));
            List<WebElement> items = driver.findElements(notificationItems);
            return items.size();
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Returns true if the empty state ("C'est calme par ici") is displayed.
     */
    public boolean isEmptyStateVisible() {
        try {
            // EXPLICIT WAIT: empty state element visible
            return wait.until(
                    ExpectedConditions.visibilityOfElementLocated(emptyState)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns true if either notification items OR the empty state is shown.
     * Used for generic page-loaded assertion.
     */
    public boolean isNotificationListOrEmptyStateVisible() {
        try {
            // EXPLICIT WAIT: one of the two possible states must be rendered
            wait.until(ExpectedConditions.or(
                    ExpectedConditions.presenceOfElementLocated(notificationItems),
                    ExpectedConditions.presenceOfElementLocated(emptyState)
            ));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Clicks "Tout marquer comme lu" button.
     */
    public void clickMarkAllRead() {
        // EXPLICIT WAIT: button must be clickable
        wait.until(ExpectedConditions.elementToBeClickable(markAllReadBtn)).click();
    }

    /**
     * Hovers over the first notification item to reveal action buttons,
     * then clicks "Marquer comme lu" on the first unread item.
     */
    public void markFirstNotificationAsRead() {
        // EXPLICIT WAIT: at least one notification item present
        WebElement firstItem = wait.until(
                ExpectedConditions.presenceOfElementLocated(notificationItems));
        // Hover to reveal opacity-0 action buttons
        actions.moveToElement(firstItem).perform();
        // EXPLICIT WAIT: mark-as-read button is visible after hover
        WebElement markBtn = wait.until(
                ExpectedConditions.visibilityOfElementLocated(markReadBtns));
        markBtn.click();
    }

    /**
     * Hovers over the first notification item to reveal action buttons,
     * then clicks "Supprimer" on the first item.
     */
    public void deleteFirstNotification() {
        int countBefore = getNotificationItemCount();
        // EXPLICIT WAIT: at least one notification item present
        WebElement firstItem = wait.until(
                ExpectedConditions.presenceOfElementLocated(notificationItems));
        // Hover to reveal opacity-0 buttons
        actions.moveToElement(firstItem).perform();
        // EXPLICIT WAIT: delete button is visible after hover
        WebElement delBtn = wait.until(
                ExpectedConditions.visibilityOfElementLocated(deleteBtns));
        delBtn.click();
        // EXPLICIT WAIT: item count decreases (optimistic update)
        if (countBefore > 1) {
            By items = notificationItems;
            wait.until(driver ->
                    driver.findElements(items).size() < countBefore);
        }
    }

    public String getSuccessToastMessage() {
        // EXPLICIT WAIT: success toast appears after mark-all-read
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
}
