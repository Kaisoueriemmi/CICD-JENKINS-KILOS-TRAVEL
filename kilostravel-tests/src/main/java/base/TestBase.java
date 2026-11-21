package base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;
import java.util.Properties;

/**
 * Foundation class shared by all tests.
 * Provides static WebDriver/WebDriverWait access and config loading.
 * Static fields are intentional — Hooks (@Before/@After) and Page Objects
 * all reference the same driver instance within a single scenario.
 */
public class TestBase {

    private static WebDriver driver;
    private static WebDriverWait wait;
    private static final Properties CONFIG = new Properties();

    // Load config.properties once at class initialisation
    static {
        try (InputStream is = TestBase.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (is != null) {
                CONFIG.load(is);
            } else {
                System.err.println("WARNING: config.properties not found — using defaults");
            }
        } catch (IOException e) {
            System.err.println("WARNING: Could not load config.properties: " + e.getMessage());
        }
    }

    // ── Config accessors ───────────────────────────────────────────────────────

    public static String getBaseUrl() {
        return CONFIG.getProperty("base.url", "http://localhost:3000");
    }

    public static String getTestEmail() {
        return CONFIG.getProperty("test.user.email", "test@airweight.io");
    }

    public static String getTestPassword() {
        return CONFIG.getProperty("test.user.password", "Test123!");
    }

    public static long getExplicitWaitSeconds() {
        return Long.parseLong(CONFIG.getProperty("explicit.wait.seconds", "10"));
    }

    // ── Driver lifecycle ───────────────────────────────────────────────────────

    public static void setUp() {
        // WebDriverManager auto-downloads the matching ChromeDriver binary
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        // Suppress "Chrome is being controlled by automated test software" banner
        options.addArguments("--disable-infobars");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));

        wait = new WebDriverWait(driver, Duration.ofSeconds(getExplicitWaitSeconds()));

        System.out.println("[TestBase] Browser launched — " + driver.getClass().getSimpleName());
    }

    public static void tearDown() {
        if (driver != null) {
            driver.quit();
            driver = null;
            wait = null;
            System.out.println("[TestBase] Browser closed");
        }
    }

    // ── Accessors used by Page Objects ─────────────────────────────────────────

    public static WebDriver getDriver() {
        return driver;
    }

    public static WebDriverWait getWait() {
        return wait;
    }

    // ── Screenshot utility ─────────────────────────────────────────────────────

    /**
     * Captures a PNG screenshot and saves it to target/screenshots/.
     *
     * @param scenarioName used to build a readable filename
     * @return absolute path of the saved screenshot, or "" on failure
     */
    public static String captureScreenshot(String scenarioName) {
        if (driver == null) return "";
        try {
            String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
            // Replace characters invalid in filenames
            String safeName = scenarioName.replaceAll("[^a-zA-Z0-9_-]", "_");
            String folderPath = "target/screenshots/";
            Files.createDirectories(Paths.get(folderPath));

            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String destPath = folderPath + safeName + "_" + timestamp + ".png";
            Files.copy(srcFile.toPath(), Paths.get(destPath));

            String absPath = new File(destPath).getAbsolutePath();
            System.out.println("[TestBase] Screenshot saved: " + absPath);
            return absPath;
        } catch (IOException e) {
            System.err.println("[TestBase] Screenshot failed: " + e.getMessage());
            return "";
        }
    }
}
