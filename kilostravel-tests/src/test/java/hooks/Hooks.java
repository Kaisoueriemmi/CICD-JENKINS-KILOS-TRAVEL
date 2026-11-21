package hooks;

import base.TestBase;
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import reports.ExtentManager;

/**
 * Cucumber lifecycle hooks executed around every scenario.
 *
 * @Before  — opens the browser and registers a new ExtentTest node
 * @After   — captures screenshot on failure, logs result, closes browser
 *
 * _scenario is public static so Step Definitions can call
 * Hooks._scenario.log(Status.PASS, "...") for inline logging.
 */
public class Hooks {

    /** Shared ExtentTest for the current scenario — accessed by all Step Defs. */
    public static ExtentTest _scenario;

    private static final ExtentReports extent = ExtentManager.getInstance();

    // ── @Before ────────────────────────────────────────────────────────────────

    @Before
    public void setUp(Scenario scenario) {
        // Create a fresh browser for each scenario (ensures isolation)
        if (TestBase.getDriver() == null) {
            TestBase.setUp();
        }

        // Register this scenario in the HTML report
        _scenario = extent.createTest(scenario.getName());
        _scenario.log(Status.INFO, "Starting scenario: " + scenario.getName());
        _scenario.log(Status.INFO, "Tags: " + scenario.getSourceTagNames());
    }

    // ── @After ─────────────────────────────────────────────────────────────────

    @After
    public void tearDown(Scenario scenario) {
        if (scenario.isFailed()) {
            // Embed screenshot as base64 directly in the HTML report (self-contained)
            try {
                String base64 = ((TakesScreenshot) TestBase.getDriver())
                        .getScreenshotAs(OutputType.BASE64);
                // Log the failure text first, then the screenshot as a separate entry
                _scenario.fail("Scenario FAILED — see screenshot below");
                _scenario.log(Status.FAIL,
                        MediaEntityBuilder.createScreenCaptureFromBase64String(base64).build()
                );
            } catch (Exception e) {
                _scenario.fail("Scenario FAILED — could not embed screenshot: " + e.getMessage());
            }
            // Also save PNG to disk for reference
            String safeName = scenario.getName().replaceAll("[^a-zA-Z0-9_-]", "_");
            TestBase.captureScreenshot(safeName);
        } else {
            _scenario.pass("Scenario PASSED");
        }

        // Flush writes the HTML file — do this after every scenario
        extent.flush();
        System.out.println("[ExtentReport] Report updated: " + reports.ExtentManager.getReportPath());

        // Close the browser — next scenario's @Before will open a fresh one
        TestBase.tearDown();
    }
}
