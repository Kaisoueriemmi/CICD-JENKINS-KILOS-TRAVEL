package runner;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

/**
 * JUnit 4 entry point for the Cucumber suite.
 *
 * maven-surefire-plugin is configured to scan only for *Runner.class,
 * so this is the single file that triggers the full test run.
 *
 * Run all tests:   mvn test
 * Run a tag:       mvn test -Dcucumber.filter.tags="@FlightTests"
 */
@RunWith(Cucumber.class)
@CucumberOptions(
        features = "src/test/resources/features",
        glue = {"stepdefinitions", "hooks"},
        plugin = {
                "pretty",
                "html:target/cucumber-reports/index.html",
                "json:target/cucumber-reports/cucumber.json"
        },
        tags = "not @ignore"
)
public class CucumberRunner {
    // No body required — JUnit + Cucumber handle everything via annotations
}
