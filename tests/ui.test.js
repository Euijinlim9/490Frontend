const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

const BASE_URL = "http://localhost:3000";

async function waitForPage(driver) {
  await driver.wait(until.elementLocated(By.tagName("body")), 5000);
}

async function testRoute(driver, path, label) {
  await driver.get(`${BASE_URL}${path}`);
  await waitForPage(driver);
  console.log(`${label} loads`);
}

async function runTests() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // TEST 1: Home page
    await testRoute(driver, "/", "Home page");

    // TEST 2: Login form accepts input
    await driver.get(`${BASE_URL}/login`);
    await driver.wait(until.elementLocated(By.name("email")), 5000);
    await driver.findElement(By.name("email")).sendKeys("test@example.com");
    await driver.findElement(By.name("password")).sendKeys("password123");
    console.log("Login form accepts input");

    // TEST 3: Signup page loads
    await testRoute(driver, "/signup", "Signup page");

    // TEST 4: Main nav pages load
    await testRoute(driver, "/dashboard", "Dashboard page");
    await testRoute(driver, "/coach", "Coach page");
    await testRoute(driver, "/workouts", "Workouts page");
    await testRoute(driver, "/logs", "Logs page");
    await testRoute(driver, "/calendar", "Calendar page");
    await testRoute(driver, "/payments", "Payments page");
    await testRoute(driver, "/messages", "Messages page");
    await testRoute(driver, "/profile", "Profile page");
    await testRoute(driver, "/notifications", "Alerts page");

    // TEST 5: Recent pages load
    await testRoute(driver, "/recent-meals", "Recent Meals page");
    await testRoute(driver, "/recent-workouts", "Recent Workouts page");

    console.log("All UI tests passed!");
  } catch (err) {
    console.error("UI test failed:");
    console.error(err);
  } finally {
    await driver.quit();
  }
}

runTests();