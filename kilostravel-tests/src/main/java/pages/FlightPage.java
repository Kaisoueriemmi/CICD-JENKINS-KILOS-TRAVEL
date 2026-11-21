package pages;

import base.TestBase;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for /flights and /flights/add
 *
 * The Add Flight form is a 3-step wizard:
 *   Step 1 — flight info (number, airline, airports, date, type)
 *   Step 2 — baggage weights (allowed vs. actual)
 *   Step 3 — confirmation summary
 *
 * After successful submission the backend redirects to /flights list.
 *
 * Selectors use data-testid attributes added to the KilosTravel frontend.
 */
public class FlightPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // ── Step 1 selectors ───────────────────────────────────────────────────────
    // data-testid attributes were added to the Add Flight page
    private final By flightNumberInput = By.cssSelector("[data-testid='flight-number-input']");
    private final By airlineSelect     = By.cssSelector("[data-testid='airline-select']");
    private final By departureInput    = By.cssSelector("[data-testid='departure-input']");
    private final By arrivalInput      = By.cssSelector("[data-testid='arrival-input']");
    private final By flightDateInput   = By.cssSelector("[data-testid='flight-date-input']");
    private final By flightTypeSelect  = By.cssSelector("[data-testid='flight-type-select']");
    // "Suivant" button on step 1 (type=button, validated in JS)
    private final By suivantBtn        = By.cssSelector("[data-testid='suivant-btn']");

    // ── Step 2 selectors ───────────────────────────────────────────────────────
    private final By allowedWeightInput = By.cssSelector("[data-testid='allowed-weight-input']");
    private final By actualWeightInput  = By.cssSelector("[data-testid='actual-weight-input']");
    private final By suivantBtnStep2    = By.cssSelector("[data-testid='suivant-btn-step2']");

    // ── Step 3 selectors ───────────────────────────────────────────────────────
    // Confirm button (type=submit — triggers axios POST to /api/v1/flights)
    private final By confirmBtn = By.cssSelector("[data-testid='confirm-btn']");

    // ── Flights list selectors ─────────────────────────────────────────────────
    // The flights table is rendered at /flights
    private final By flightsTable    = By.cssSelector("table");
    private final By addFlightBtn    = By.xpath("//button[contains(text(),'Add Flight')]");

    // Toast notifications (Sonner — third-party, cannot add data-testid)
    private final By errorToast   = By.cssSelector("[data-sonner-toast][data-type='error']");
    private final By successToast = By.cssSelector("[data-sonner-toast][data-type='success']");

    // ── Constructor ────────────────────────────────────────────────────────────

    public FlightPage() {
        this.driver = TestBase.getDriver();
        this.wait   = TestBase.getWait();
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    public void navigateToAddFlight() {
        driver.get(TestBase.getBaseUrl() + "/flights/add");
        // EXPLICIT WAIT: step 1 form visible (flight number input present)
        wait.until(ExpectedConditions.visibilityOfElementLocated(flightNumberInput));
    }

    public void navigateToFlightsList() {
        driver.get(TestBase.getBaseUrl() + "/flights");
        // EXPLICIT WAIT: flights page header visible
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//h1[contains(text(),'Flight')]")));
    }

    // ── Step 1 ─────────────────────────────────────────────────────────────────

    public void enterFlightNumber(String flightNumber) {
        // EXPLICIT WAIT: input is visible and interactable
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(flightNumberInput));
        el.clear();
        el.sendKeys(flightNumber);
    }

    public void clearFlightNumber() {
        // EXPLICIT WAIT: input is visible
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(flightNumberInput));
        el.clear();
    }

    public void selectAirline(String airlineName) {
        // EXPLICIT WAIT: select element is present
        WebElement el = wait.until(ExpectedConditions.presenceOfElementLocated(airlineSelect));
        new Select(el).selectByVisibleText(airlineName);
    }

    public void enterDepartureAirport(String code) {
        // EXPLICIT WAIT: airport input visible
        // The AirportAutocomplete updates formData.departure_airport on every keystroke
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(departureInput));
        el.clear();
        el.sendKeys(code);
    }

    public void enterArrivalAirport(String code) {
        // EXPLICIT WAIT: airport input visible
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(arrivalInput));
        el.clear();
        el.sendKeys(code);
    }

    public void enterFlightDate(String date) {
        // Chrome's date input does not accept sendKeys reliably — use JS to set value
        // and dispatch a React-compatible input event so formData.flight_date is updated
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(flightDateInput));
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript(
            "var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;" +
            "nativeInputValueSetter.call(arguments[0], arguments[1]);" +
            "arguments[0].dispatchEvent(new Event('input', {bubbles:true}));" +
            "arguments[0].dispatchEvent(new Event('change', {bubbles:true}));",
            el, date);
    }

    public void selectFlightType(String typeValue) {
        // EXPLICIT WAIT: select is present
        WebElement el = wait.until(ExpectedConditions.presenceOfElementLocated(flightTypeSelect));
        new Select(el).selectByValue(typeValue);
    }

    /** Click "Suivant" on step 1. Uses JS executor to bypass any autocomplete dropdown overlay. */
    public void clickSuivantStep1() {
        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(suivantBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
    }

    // ── Step 2 ─────────────────────────────────────────────────────────────────

    /** Wait until step 2 is rendered (allowed weight input must appear). */
    public void waitForStep2() {
        // EXPLICIT WAIT: step 2 form shows allowed weight input
        wait.until(ExpectedConditions.visibilityOfElementLocated(allowedWeightInput));
    }

    public void enterAllowedWeight(String kg) {
        // EXPLICIT WAIT: numeric input visible on step 2
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(allowedWeightInput));
        el.clear();
        el.sendKeys(kg);
    }

    public void enterActualWeight(String kg) {
        // EXPLICIT WAIT: numeric input visible
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(actualWeightInput));
        el.clear();
        el.sendKeys(kg);
    }

    public void clickSuivantStep2() {
        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(suivantBtnStep2));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
    }

    // ── Step 3 ─────────────────────────────────────────────────────────────────

    /** Wait until step 3 (confirmation) is rendered. */
    public void waitForStep3() {
        // EXPLICIT WAIT: confirm button appears when step 3 loads
        wait.until(ExpectedConditions.visibilityOfElementLocated(confirmBtn));
    }

    /** Click "Confirmer" — triggers flight creation via onClick handler. Uses JS executor
     *  to guarantee the click event fires on the React element regardless of any overlays. */
    public void clickConfirm() {
        // EXPLICIT WAIT: confirm button must be present and enabled
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(confirmBtn));
        // Use JS click to ensure the React onClick handler fires
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
    }

    // ── Post-submission ────────────────────────────────────────────────────────

    /** Wait for Next.js router.push('/flights') to complete. */
    public void waitForRedirectToFlightsList() {
        // EXPLICIT WAIT: URL changes to /flights (with or without trailing slash)
        wait.until(ExpectedConditions.urlMatches(".*localhost:3000/flights[/]?$"));
        // EXPLICIT WAIT: flights page heading must be present
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//h1 | //table | //h2[contains(text(),'Vols') or contains(text(),'Flights')]")));
    }

    /**
     * Returns true if the given flight number appears in the flights table.
     * The flight number is rendered inside a <td> > <div> cell.
     */
    public boolean isFlightInList(String flightNumber) {
        By locator = By.xpath(
                "//td//div[normalize-space(text())='" + flightNumber + "']");
        try {
            // EXPLICIT WAIT: flight must appear in the table after redirect
            wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ── Error / toast messages ─────────────────────────────────────────────────

    public String getErrorToastMessage() {
        // EXPLICIT WAIT: error toast from Sonner appears after validation failure
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(errorToast));
        return toast.getText();
    }

    public boolean isErrorToastVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorToast)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    public String getSuccessToastMessage() {
        // EXPLICIT WAIT: success toast after flight created
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(successToast));
        return toast.getText();
    }
}
