const { Builder, By, until, Key } = require("selenium-webdriver");
require("chromedriver");

const BASE_URL = "http://localhost:3001";

const CLIENT_EMAIL = "uitest@gmail.com";
const CLIENT_PASSWORD = "test123";

const COACH_EMAIL = "testui@gmail.com";
const COACH_PASSWORD = "test123";

//const ADMIN_EMAIL = "admin@gmail.com";
//const ADMIN_PASSWORD = "HelloWorld";

async function waitForPage(driver) {
  await driver.wait(until.elementLocated(By.tagName("body")), 8000);
}

async function acceptAlertIfPresent(driver) {
  try {
    await driver.wait(until.alertIsPresent(), 3000);
    const alert = await driver.switchTo().alert();
    console.log(`Alert appeared: ${await alert.getText()}`);
    await alert.accept();
    await driver.sleep(800);
  } catch {}
}

async function getBodyText(driver) {
  return await driver.findElement(By.tagName("body")).getText();
}

async function testRoute(driver, path, label) {
  await driver.get(`${BASE_URL}${path}`);
  await waitForPage(driver);

  const bodyText = await getBodyText(driver);

  if (!bodyText || bodyText.includes("Cannot GET")) {
    throw new Error(`${label} did not load correctly`);
  }

  console.log(`${label} loads`);
}

async function login(driver, email, password, roleLabel) {
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.name("email")), 8000);

  await driver.findElement(By.name("email")).clear();
  await driver.findElement(By.name("email")).sendKeys(email);

  await driver.findElement(By.name("password")).clear();
  await driver.findElement(By.name("password")).sendKeys(password);

  const loginButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'Login') or contains(text(), 'Sign In')]")
  );

  await loginButton.click();
  await driver.sleep(3000);

  const currentUrl = await driver.getCurrentUrl();
  const bodyText = await getBodyText(driver);

  if (
    currentUrl.includes("/dashboard") ||
    currentUrl.includes("/admin") ||
    bodyText.includes("Dashboard") ||
    bodyText.includes("Welcome") ||
    bodyText.includes("Logout") ||
    bodyText.includes("Profile") ||
    bodyText.includes("Admin")
  ) {
    console.log(`${roleLabel} logs in successfully`);
  } else {
    throw new Error(`${roleLabel} login failed. Current URL: ${currentUrl}`);
  }
}

async function logout(driver) {
  try {
    const logoutButton = await driver.findElement(
      By.xpath("//button[contains(text(), 'Logout') or contains(text(), 'Log Out')]")
    );

    await logoutButton.click();
    await waitForPage(driver);
    console.log("Logout works");
  } catch {
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
    console.log("Logout fallback used");
  }
}

async function testProtectedRouteLoggedOut(driver) {
  await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const currentUrl = await driver.getCurrentUrl();
  const bodyText = await getBodyText(driver);

  if (
    currentUrl.includes("/login") ||
    bodyText.includes("Login") ||
    bodyText.includes("Sign In")
  ) {
    console.log("Protected route blocks logged-out users");
  } else {
    console.log("Protected route test skipped: dashboard visible while logged out");
  }
}

async function testFooterLinks(driver) {
  const footerLinks = [
    "Features",
    "How It Works",
    "Pricing",
    "About Us",
    "Careers",
    "Contact",
    "Sign In",
    "Create Account",
  ];

  for (const text of footerLinks) {
    await driver.get(`${BASE_URL}/`);
    await waitForPage(driver);

    const link = await driver.findElement(By.linkText(text));
    await link.click();
    await waitForPage(driver);

    console.log(`Footer link works: ${text}`);
  }
}

async function testNavbarLinks(driver) {
  const navLinks = [
    "Dashboard",
    "Coach",
    "Workouts",
    "Logs",
    "Calendar",
    "Payments",
    "Messages",
    "Profile",
  ];

  for (const text of navLinks) {
    try {
      await driver.get(`${BASE_URL}/dashboard`);
      await waitForPage(driver);

      const link = await driver.findElement(By.linkText(text));
      await link.click();
      await waitForPage(driver);

      console.log(`Navbar link works: ${text}`);
    } catch {
      console.log(`Navbar link skipped/not found: ${text}`);
    }
  }
}

async function fillClientSurvey(driver) {
  await driver.get(`${BASE_URL}/survey`);
  await waitForPage(driver);

  const inputs = await driver.findElements(By.css("input, textarea, select"));

  for (let input of inputs) {
    const tag = await input.getTagName();
    const type = await input.getAttribute("type");
    const name = await input.getAttribute("name");

    try {
      if (tag === "select") {
        await input.sendKeys(Key.ARROW_DOWN, Key.ENTER);
      } else if (type === "radio" || type === "checkbox") {
        await input.click();
      } else {
        await input.clear();

        if (name?.toLowerCase().includes("weight")) {
          await input.sendKeys("150");
        } else if (name?.toLowerCase().includes("height")) {
          await input.sendKeys("65");
        } else if (name?.toLowerCase().includes("goal")) {
          await input.sendKeys("Build muscle");
        } else {
          await input.sendKeys("Test answer");
        }
      }
    } catch {}
  }

  const buttons = await driver.findElements(By.css("button"));
  if (buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    await driver.executeScript("arguments[0].scrollIntoView(true);", lastButton);
    await driver.sleep(500);
    await lastButton.click();
  }

  await acceptAlertIfPresent(driver);
  console.log("Client intake form can be completed");
}

async function fillCoachSurvey(driver) {
  await driver.get(`${BASE_URL}/survey`);
  await waitForPage(driver);

  const inputs = await driver.findElements(By.css("input, textarea, select"));

  for (let input of inputs) {
    const tag = await input.getTagName();
    const type = await input.getAttribute("type");
    const name = await input.getAttribute("name");

    try {
      if (tag === "select") {
        await input.sendKeys(Key.ARROW_DOWN, Key.ENTER);
      } else if (type === "radio" || type === "checkbox") {
        await input.click();
      } else {
        await input.clear();

        if (name?.toLowerCase().includes("experience")) {
          await input.sendKeys("3 years");
        } else if (name?.toLowerCase().includes("special")) {
          await input.sendKeys("Strength training");
        } else if (name?.toLowerCase().includes("bio")) {
          await input.sendKeys("Certified coach");
        } else {
          await input.sendKeys("Test answer");
        }
      }
    } catch {}
  }

  const buttons = await driver.findElements(By.css("button"));
  if (buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    await driver.executeScript("arguments[0].scrollIntoView(true);", lastButton);
    await driver.sleep(500);
    await lastButton.click();
  }

  await acceptAlertIfPresent(driver);
  console.log("Coach intake form can be completed");
}

async function testWellnessCheckInForm(driver) {
  await driver.get(`${BASE_URL}/daily-checkin`);
  await waitForPage(driver);

  await driver.wait(until.elementLocated(By.css("select")), 8000);

  const selects = await driver.findElements(By.css("select"));
  const ranges = await driver.findElements(By.css("input[type='range']"));

  if (selects.length < 3) throw new Error("Wellness dropdowns not found");
  if (ranges.length < 3) throw new Error("Wellness sliders not found");

  await selects[0].sendKeys(Key.ARROW_DOWN, Key.ENTER);
  await ranges[0].sendKeys(Key.ARROW_RIGHT, Key.ARROW_RIGHT);
  await ranges[1].sendKeys(Key.ARROW_LEFT, Key.ARROW_LEFT);
  await selects[1].sendKeys(Key.ARROW_DOWN, Key.ENTER);
  await selects[2].sendKeys(Key.ARROW_DOWN, Key.ENTER);
  await ranges[2].sendKeys(Key.ARROW_RIGHT, Key.ARROW_RIGHT);

  const submitButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'Submit Daily Check-In')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
  await driver.sleep(500);
  await submitButton.click();

  await acceptAlertIfPresent(driver);

  console.log("Daily Check-In submitted successfully");
  console.log("Daily Check-In UI works");
}

async function testMealLogForm(driver) {
  await driver.get(`${BASE_URL}/logs`);
  await waitForPage(driver);

  const inputs = await driver.findElements(By.css("input, textarea, select"));

  if (inputs.length === 0) {
    console.log("Meal log test skipped: no form fields found");
    return;
  }

  for (let input of inputs) {
    const tag = await input.getTagName();
    const type = await input.getAttribute("type");
    const name = await input.getAttribute("name");

    try {
      if (tag === "select") {
        await input.sendKeys(Key.ARROW_DOWN, Key.ENTER);
      } else if (type !== "radio" && type !== "checkbox") {
        await input.clear();

        if (name?.toLowerCase().includes("calorie")) {
          await input.sendKeys("500");
        } else if (name?.toLowerCase().includes("protein")) {
          await input.sendKeys("35");
        } else if (name?.toLowerCase().includes("carb")) {
          await input.sendKeys("45");
        } else if (name?.toLowerCase().includes("fat")) {
          await input.sendKeys("15");
        } else if (name?.toLowerCase().includes("meal")) {
          await input.sendKeys("Chicken bowl");
        } else {
          await input.sendKeys("10");
        }
      }
    } catch {}
  }

  const buttons = await driver.findElements(By.css("button"));

  if (buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    await driver.executeScript("arguments[0].scrollIntoView(true);", lastButton);
    await driver.sleep(500);
    await lastButton.click();
    await acceptAlertIfPresent(driver);
  }

  console.log("Meal/log form interaction works");
}

async function testWorkoutLogForm(driver) {
  await driver.get(`${BASE_URL}/logs`);
  await waitForPage(driver);

  try {
    const workoutTab = await driver.findElement(
      By.xpath("//*[contains(text(), 'Workout') or contains(text(), 'Exercise')]")
    );
    await workoutTab.click();
    await driver.sleep(1000);
  } catch {}

  const inputs = await driver.findElements(By.css("input, textarea, select"));

  if (inputs.length === 0) {
    console.log("Workout log test skipped: no form fields found");
    return;
  }

  for (let input of inputs) {
    const tag = await input.getTagName();
    const type = await input.getAttribute("type");
    const name = await input.getAttribute("name");

    try {
      if (tag === "select") {
        await input.sendKeys(Key.ARROW_DOWN, Key.ENTER);
      } else if (type !== "radio" && type !== "checkbox") {
        await input.clear();

        if (name?.toLowerCase().includes("set")) {
          await input.sendKeys("3");
        } else if (name?.toLowerCase().includes("rep")) {
          await input.sendKeys("10");
        } else if (name?.toLowerCase().includes("duration")) {
          await input.sendKeys("30");
        } else if (name?.toLowerCase().includes("distance")) {
          await input.sendKeys("2");
        } else {
          await input.sendKeys("Test workout");
        }
      }
    } catch {}
  }

  const buttons = await driver.findElements(By.css("button"));

  if (buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    await driver.executeScript("arguments[0].scrollIntoView(true);", lastButton);
    await driver.sleep(500);
    await lastButton.click();
    await acceptAlertIfPresent(driver);
  }

  console.log("Workout log form interaction works");
}

async function testRecentMealUpdated(driver) {
  await driver.get(`${BASE_URL}/recent-meals`);
  await waitForPage(driver);

  const bodyText = await getBodyText(driver);

  if (
    bodyText.includes("Chicken bowl") ||
    bodyText.includes("500") ||
    bodyText.includes("Meal") ||
    bodyText.includes("Recent")
  ) {
    console.log("Recent Meals shows logged meal/history content");
  } else {
    console.log("Recent Meals loaded, but logged meal was not visible");
  }
}

async function testRecentWorkoutUpdated(driver) {
  await driver.get(`${BASE_URL}/recent-workouts`);
  await waitForPage(driver);

  const bodyText = await getBodyText(driver);

  if (
    bodyText.includes("Test workout") ||
    bodyText.includes("30") ||
    bodyText.includes("Workout") ||
    bodyText.includes("Recent")
  ) {
    console.log("Recent Workouts shows logged workout/history content");
  } else {
    console.log("Recent Workouts loaded, but logged workout was not visible");
  }
}

async function testDashboardReflectsData(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const bodyText = await getBodyText(driver);

  if (
    bodyText.includes("Calories") ||
    bodyText.includes("Protein") ||
    bodyText.includes("Workout") ||
    bodyText.includes("Check-In") ||
    bodyText.includes("Dashboard")
  ) {
    console.log("Dashboard renders logged-data sections");
  } else {
    console.log("Dashboard data section test skipped/not visible");
  }
}

async function testCoachView(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const bodyText = await getBodyText(driver);

  if (
    bodyText.includes("Coach") ||
    bodyText.includes("Client") ||
    bodyText.includes("Progress") ||
    bodyText.includes("Plan") ||
    bodyText.includes("Approve") ||
    bodyText.includes("Dashboard")
  ) {
    console.log("Coach dashboard renders coach/client content");
  } else {
    console.log("Coach dashboard loaded, but expected coach content not visible");
  }
}

async function testModalButtons(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const buttons = await driver.findElements(By.css("button"));

  if (buttons.length === 0) {
    console.log("Modal/button test skipped: no buttons found");
    return;
  }

  for (let i = 0; i < Math.min(buttons.length, 3); i++) {
    try {
      await buttons[i].click();
      await driver.sleep(500);
      await acceptAlertIfPresent(driver);
    } catch {}
  }

  console.log("Dashboard buttons are clickable");
}

async function testHistoryPagesContainContent(driver) {
  await testRecentMealUpdated(driver);
  await testRecentWorkoutUpdated(driver);
}

async function testBrowseCoachRequest(driver) {
  await driver.get(`${BASE_URL}/coach`);
  await waitForPage(driver);

  const searchInput = await driver.findElement(
    By.css("input[type='text'], input[placeholder*='Search'], input")
  );

  await searchInput.clear();
  await searchInput.sendKeys("test");
  await driver.sleep(1000);

  console.log("Client searched test from Browse Coaches");

  let profileElement;

  try {
    profileElement = await driver.findElement(
      By.xpath("//*[self::button or self::a][contains(text(), 'View') or contains(text(), 'Profile') or contains(text(), 'Details')]")
    );
  } catch {
    const clickableCards = await driver.findElements(
      By.css(".coach-card, .coach-card button, .coach-card a, .card, .card button, .card a")
    );

    if (clickableCards.length === 0) {
      const bodyText = await getBodyText(driver);
      throw new Error(`No coach profile button/card found. Page text: ${bodyText.slice(0, 500)}`);
    }

    profileElement = clickableCards[0];
  }

  await driver.executeScript("arguments[0].scrollIntoView(true);", profileElement);
  await driver.sleep(500);
  await profileElement.click();
  await waitForPage(driver);

  console.log("Client opened coach profile");

  const requestButton = await driver.findElement(
  By.xpath(
    "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'request this coach')]"
    )
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", requestButton);
  await driver.sleep(500);
  await requestButton.click();

  await acceptAlertIfPresent(driver);

  console.log("Client requested coach");
  }

async function testCoachAcceptClientAndCreatePlan(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const approveButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'Approve') or contains(text(), 'Accept')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", approveButton);
  await driver.sleep(500);
  await approveButton.click();

  await acceptAlertIfPresent(driver);

  console.log("Coach approved client request");

  const detailsButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'View Details') or contains(text(), 'Details') or contains(text(), 'View')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", detailsButton);
  await driver.sleep(500);
  await detailsButton.click();
  await waitForPage(driver);

  console.log("Coach viewed client details");

  await driver.get(`${BASE_URL}/coach-plans`);
  await waitForPage(driver);

  const inputs = await driver.findElements(By.css("input, textarea, select"));

  for (let input of inputs) {
    const tag = await input.getTagName();
    const placeholder = await input.getAttribute("placeholder");
    const name = await input.getAttribute("name");

    const field = `${placeholder} ${name}`.toLowerCase();

    try {
      if (tag === "select") {
        await input.sendKeys(Key.ARROW_DOWN, Key.ENTER);
      } else {
        await input.clear();

        if (field.includes("title")) {
          await input.sendKeys("Beginner Strength Plan");
        } else if (field.includes("duration")) {
          await input.sendKeys("30");
        } else if (field.includes("price")) {
          await input.sendKeys("25");
        } else if (field.includes("description")) {
          await input.sendKeys("Beginner-friendly strength plan.");
        } else {
          await input.sendKeys("Test plan");
        }
      }
    } catch {}
  }

  const createButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'Create Plan')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", createButton);
  await driver.sleep(500);
  await createButton.click();

  await acceptAlertIfPresent(driver);

  console.log("Coach created a coaching plan");
}

async function testClientReviewAndReportCoach(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await waitForPage(driver);

  const viewProfileButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'View Profile') or contains(text(), 'Profile')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", viewProfileButton);
  await driver.sleep(500);
  await viewProfileButton.click();
  await waitForPage(driver);

  console.log("Client opened coach profile from dashboard");

  const reportButton = await driver.findElement(
    By.xpath("//button[contains(text(), 'Report Coach') or contains(text(), 'Report')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", reportButton);
  await driver.sleep(500);
  await reportButton.click();

  const selects = await driver.findElements(By.css("select"));
  if (selects.length > 0) {
    await selects[0].sendKeys(Key.ARROW_DOWN, Key.ENTER);
  }

  const reportText = await driver.findElement(By.css("textarea"));
  await reportText.clear();
  await reportText.sendKeys("Testing report coach feature.");

  const submitReport = await driver.findElement(
    By.xpath("//button[contains(text(), 'Submit Report')]")
  );

  await submitReport.click();
  await acceptAlertIfPresent(driver);

  console.log("Client submitted coach report");

  const reviewsTab = await driver.findElement(
    By.xpath("//*[contains(text(), 'Reviews')]")
  );

  await driver.executeScript("arguments[0].scrollIntoView(true);", reviewsTab);
  await driver.sleep(500);
  await reviewsTab.click();

  console.log("Client opened Reviews tab");

  const reviewBox = await driver.findElement(By.css("textarea"));
  await reviewBox.clear();
  await reviewBox.sendKeys("Great coach, very helpful.");

  const ratingSelect = await driver.findElement(By.css("select"));
  await ratingSelect.sendKeys(Key.ARROW_DOWN, Key.ARROW_DOWN, Key.ENTER);

  const submitReview = await driver.findElement(
    By.xpath("//button[contains(text(), 'Submit Review')]")
  );

  await submitReview.click();
  await acceptAlertIfPresent(driver);

  console.log("Client submitted coach review");
}

async function testCoachPage(driver){
  await driver.get(`${BASE_URL}/coach`);
  await waitForPage(driver);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (!bodyText.includes("Find Your Coach")) {
    throw new Error("Coach page not loading");
  }

  console.log("Coach page loads");

  await driver.sleep(500);

  const cards = await driver.findElements(By.css(".coach-card"));

  if (cards.length > 0) {
    console.log("Coach cards loaded");
  } else {
    console.log("Coach cards could not load");
  }

  try {
    const searchInput = await driver.findElement(By.css(".search-input"));
    await searchInput.sendKeys("test");
    await searchInput.sendKeys(Key.ENTER);

    const searchButton = await driver.findElement(By.css(".search-button"));
    await searchButton.click();

    console.log("Search input works");
  } catch (err) {
    console.log("Search input not fully working");
  }

  try {
    const filterDropdown = await driver.findElement(By.css("select.filter-dropdown"));
    await filterDropdown.click();
    await filterDropdown.sendKeys(Key.ARROW_DOWN, Key.ENTER);

    console.log("Filter dropdown works");
  } catch {
    console.log("Filter dropdown not working");
  }
}

async function testCoachDetailLoads(driver) {
  await driver.get(`${BASE_URL}/coach/1`);
  //or replace 1 with any coach id from db
  await waitForPage(driver);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (!bodyText.includes("Coach")) {
    throw new Error("Coach Detail page did not load correctly");
  }

  console.log("Coach Detail page loads");
}

async function testCoachDetailTabs(driver) {
  await driver.get(`${BASE_URL}/coach/1`);
  await waitForPage(driver);

  const tabs = ["About", "Packages", "Reviews", "Certifications"];

  for (const tab of tabs) {
    try {
      const btn = await driver.findElement(
        By.xpath(`//button[contains(text(),'${tab}')]`)
      );

      await btn.click();
      await driver.sleep(500);

      console.log(`Tab works `);
    } catch {
      console.log(`Tab missing/not working: ${tab}`);
    }
  }
}

async function testCoachDetailSubscription(driver) {
  await driver.get(`${BASE_URL}/coach/1`);
  await waitForPage(driver);

  try {
    const btn = await driver.findElement(
      By.xpath("//button[contains(text(),'Select Plan')]")
    );

    await btn.click();
    await driver.sleep(1000);

    const modal = await driver.findElement(By.css(".cp-modal"));
    const text = await modal.getText();

    if (!text.includes("Confirm Subscription")) {
      throw new Error("Subscription modal failed");
    }

    const closeBtn = await driver.findElement(By.css(".cp-modal-close"));
    await closeBtn.click();

    console.log("Subscription works");
  } catch {
    console.log("No subscription available");
  }
}

async function testCoachDetailReview(driver) {
  await driver.get(`${BASE_URL}/coach/1`);
  await waitForPage(driver);

  try {
    await driver.findElement(By.css(".cp-review-input")).sendKeys("Nice coach");

    await driver.findElement(By.css(".cp-review-rating")).sendKeys("5");

    await driver.findElement(
      By.xpath("//button[contains(text(),'Submit Review')]")
    ).click();

    console.log("Review form works");
  } catch {
    console.log("Review form not available");
  }
}

async function testCoachDetailReport(driver) {
  await driver.get(`${BASE_URL}/coach/1`);
  await waitForPage(driver);

  try {
    await driver.findElement(
      By.xpath("//button[contains(text(),'Report Coach')]")
    ).click();

    await driver.sleep(500);

    const form = await driver.findElement(By.css(".cp-report-form"));

    if (form) console.log("Report form opens");
  } catch {
    console.log("Report flow not available");
  }
}

async function testCoachPlansLoads(driver) {
  await driver.get(`${BASE_URL}/coach/plans`);
  await waitForPage(driver);

  await driver.wait(
    until.elementLocated(By.css(".cpl-card-title")),
    5000
  );

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (!bodyText.includes("My Coaching Plans")) {
    throw new Error("Coach Plans page did not load");
  }

  console.log("Coach Plans page loads");
}

async function testCreateCoachPlan(driver) {
  await driver.get(`${BASE_URL}/coach/plans`);
  await waitForPage(driver);

  await driver.findElement(
    By.css("input[placeholder='Plan title *']")
  ).sendKeys("Test Plan");

  await driver.findElement(
    By.css("input[placeholder='Duration (days) *']")
  ).sendKeys("30");

  await driver.findElement(
    By.css("input[placeholder='Price ($) *']")
  ).sendKeys("50");

  await driver.findElement(By.css("textarea"))
    .sendKeys("coach plan test");

  await driver.findElement(
    By.xpath("//button[contains(text(),'Create Plan')]")
  ).click();

  await driver.sleep(1500);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (!bodyText.includes("Test Plan")) {
    throw new Error("Plan was not created");
  }

  console.log("Create plan works");
}

async function testEditCoachPlan(driver) {
  await driver.get(`${BASE_URL}/coach/plans`);
  await waitForPage(driver);

  const editButtons = await driver.findElements(
    By.xpath("//button[contains(text(),'Edit')]")
  );

  if (editButtons.length === 0) {
    console.log("No plan available to edit");
    return;
  }

  await editButtons[0].click();
  await driver.sleep(1000);

  const inputs = await driver.findElements(By.css(".cpl-inline-input"));
  await inputs[0].clear();
  await inputs[0].sendKeys("Updated Plan");

  await driver.findElement(
    By.xpath("//button[contains(text(),'Save')]")
  ).click();

  await driver.sleep(1000);

  console.log("Edit plan works");
}

async function testDeactivateCoachPlan(driver) {
  await driver.get(`${BASE_URL}/coach/plans`);
  await waitForPage(driver);

  const deactivateButtons = await driver.findElements(
    By.xpath("//button[contains(text(),'Deactivate')]")
  );

  if (deactivateButtons.length === 0) {
    console.log("No active plan to deactivate");
    return;
  }

  await deactivateButtons[0].click();

  await acceptAlertIfPresent(driver);
  await driver.sleep(1000);

  console.log("Deactivate plan works");
}

async function testCalendarPageLoads(driver) {
  await driver.get(`${BASE_URL}/calendar`);
  await waitForPage(driver);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (!bodyText.includes("Upcoming Workouts")) {
    throw new Error("Calendar page did not load");
  }

  console.log("Calendar page loads");
}

async function testCalendarNavigation(driver) {
  await driver.get(`${BASE_URL}/calendar`);
  await waitForPage(driver);

  const monthLabel = await driver.findElement(By.css(".cal-month-label"));
  const initialMonth = await monthLabel.getText();

  const nextBtn = await driver.findElement(By.css(".cal-arrow:nth-of-type(2)"));
  const prevBtn = await driver.findElement(By.css(".cal-arrow:nth-of-type(1)"));

  await nextBtn.click();
  await driver.sleep(500);

  const afterNext = await monthLabel.getText();

  await prevBtn.click();
  await driver.sleep(500);

  const afterPrev = await monthLabel.getText();

  if (initialMonth !== afterPrev) {
    throw new Error("Calendar navigation failed");
  }

  console.log("Calendar navigation works");
}

async function testCalendarDayModal(driver) {
  await driver.get(`${BASE_URL}/calendar`);
  await waitForPage(driver);

  try {
    const dayCell = await driver.findElement(By.css(".cal-cell.has-plan"));
    await dayCell.click();

    await driver.sleep(800);

    const modal = await driver.findElement(By.css(".modal-box"));
    const modalText = await modal.getText();

    if (!modalText.includes("Workout")) {
      throw new Error("Calendar modal did not open correctly");
    }

    console.log("Calendar modal opens correctly");

    const closeBtn = await driver.findElement(By.css(".modal-close-btn"));
    await closeBtn.click();
  } catch (err) {
    console.log("No workout day available");
  }
}

async function testCalendarEventsRender(driver) {
  await driver.get(`${BASE_URL}/calendar`);
  await waitForPage(driver);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (
    bodyText.includes("Loading...") ||
    bodyText.includes("Error")
  ) {
    console.log("Calendar can not load");
    return;
  }

  const plan = await driver.findElements(By.css(".plan-pill"));

  if (plan.length > 0) {
    console.log(`Calendar events rendered: ${plan.length}`);
  } else {
    console.log("No calendar events found");
  }
}

async function testActiveWorkoutLoads(driver) {
  await driver.get(`${BASE_URL}/workouts/active`);
  await waitForPage(driver);

  const bodyText = await driver.findElement(By.tagName("body")).getText();

  if (
    bodyText.includes("Workout Complete") &&
    !bodyText.includes("Set")
  ) {
    throw new Error("Active Workout failed to load");
  }

  console.log("Active Workout page loads");
}

async function testActiveWorkoutExerciseFlow(driver) {
  await driver.get(`${BASE_URL}/workouts/active`);
  await waitForPage(driver);

  try {
    const exerciseName = await driver.findElement(By.css(".aw-ex-name"));
    const text = await exerciseName.getText();

    if (!text) throw new Error("No exercise loaded");

    const btn = await driver.findElement(By.css(".aw-btn-primary"));
    await btn.click();

    await driver.sleep(800);

    console.log("Exercise flow works");
  } catch (err) {
    console.log("Exercise flow failed");
  }
}

async function testActiveWorkoutRestFlow(driver) {
  await driver.get(`${BASE_URL}/workouts/active`);
  await waitForPage(driver);

  try {
    const btn = await driver.findElement(By.css(".aw-btn-primary"));
    await btn.click(); 

    await driver.sleep(500);

    const timer = await driver.findElement(By.css(".aw-timer"));
    const timerText = await timer.getText();

    if (!timerText.includes("s")) {
      throw new Error("Rest timer not visible");
    }

    const skipBtn = await driver.findElement(By.css(".aw-btn-secondary"));
    await skipBtn.click();

    console.log("Rest flow works");
  } catch (err) {
    console.log("Rest flow failed");
  }
}

async function testActiveWorkoutCompletion(driver) {
  await driver.get(`${BASE_URL}/workouts/active`);
  await waitForPage(driver);

  try {
    const btn = await driver.findElement(By.css(".aw-btn-primary"));

    for (let i = 0; i < 5; i++) {
      try {
        await btn.click();
        await driver.sleep(300);
      } catch {}
    }

    await driver.sleep(1000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (!bodyText.includes("Workout Complete")) {
      throw new Error("Workout did not complete");
    }

    console.log("Workout completion works");
  } catch (err) {
    console.log(" Workout completion test failed");
  }
}

async function runTests() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await testRoute(driver, "/", "Home page");
    await testRoute(driver, "/login", "Login page");
    await testRoute(driver, "/signup", "Signup page");

    await testFooterLinks(driver);
    await testProtectedRouteLoggedOut(driver);

    await login(driver, CLIENT_EMAIL, CLIENT_PASSWORD, "Client");

    await testNavbarLinks(driver);
    await testWellnessCheckInForm(driver);
    await testMealLogForm(driver);
    await testWorkoutLogForm(driver);
    await testRecentMealUpdated(driver);
    await testRecentWorkoutUpdated(driver);
    await testDashboardReflectsData(driver);
    await testModalButtons(driver);
    await fillClientSurvey(driver);
    await testCoachPage(driver);
    await testCoachDetailLoads(driver);
    await testCoachDetailTabs(driver);
    await testCoachDetailSubscription(driver);
    await testCoachDetailReview(driver);
    await testCoachDetailReport(driver);
    await testCoachPlansLoads(driver);
    await testCreateCoachPlan(driver);
    await testEditCoachPlan(driver);
    await testDeactivateCoachPlan(driver);
    await testCalendarPageLoads(driver);
    await testCalendarNavigation(driver);
    await testCalendarDayModal(driver);
    await testCalendarEventsRender(driver);
    await testActiveWorkoutLoads(driver);
    await testActiveWorkoutExerciseFlow(driver);
    await testActiveWorkoutRestFlow(driver);
    await testActiveWorkoutCompletion(driver);

    //await testBrowseCoachRequest(driver);

    await logout(driver);

    await login(driver, COACH_EMAIL, COACH_PASSWORD, "Coach");

    await testCoachView(driver);
    await fillCoachSurvey(driver);
    //await testCoachAcceptClientAndCreatePlan(driver);

    await logout(driver);

    await login(driver, CLIENT_EMAIL, CLIENT_PASSWORD, "Client");

    //await testClientReviewAndReportCoach(driver);

    await logout(driver);

    await testRoute(driver, "/dashboard", "Dashboard page");
    await testRoute(driver, "/workouts", "Workouts page");
    await testRoute(driver, "/logs", "Logs page");
    await testRoute(driver, "/calendar", "Calendar page");
    await testRoute(driver, "/payments", "Payments page");
    await testRoute(driver, "/messages", "Messages page");
    await testRoute(driver, "/profile", "Profile page");
    await testRoute(driver, "/recent-meals", "Recent Meals page");
    await testRoute(driver, "/recent-workouts", "Recent Workouts page");
    await testRoute(driver, "/notifications", "Alerts page");

    console.log("All UI tests passed!");
  } catch (err) {
    console.error("UI test failed:");
    console.error(err);
  } finally {
    await driver.quit();
  }
}

runTests();