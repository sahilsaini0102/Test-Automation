require("dotenv").config();

const { test, expect } = require("@playwright/test");
const { sendLoginEmail } = require("../utils/test-email");

test("EduEmissary login status check", async ({ page }) => {
  let loginError = null;

  try {
    const loginUrl = process.env.LOGIN_URL;
    const username = process.env.LOGIN_USERNAME;
    const password = process.env.LOGIN_PASSWORD;

    expect(loginUrl, "LOGIN_URL must be configured").toBeTruthy();
    expect(username, "LOGIN_USERNAME must be configured").toBeTruthy();
    expect(password, "LOGIN_PASSWORD must be configured").toBeTruthy();

    console.log("Opening EduEmissary website...");

    await page.goto(loginUrl, {
      waitUntil: "domcontentloaded",
    });

    console.log("Entering login credentials...");

    await page.getByPlaceholder(/SchoolCode_Email/i).fill(username);
    await page.getByPlaceholder(/Enter password/i).fill(password);
    await page.getByRole("button", { name: /login/i }).click();

    console.log("Checking login status...");

    await expect(page.getByPlaceholder(/Enter password/i)).toBeHidden({
      timeout: 30000,
    });

    console.log("EduEmissary login successful!");
  } catch (error) {
    loginError = error;
    console.error("EduEmissary login failed:", error.message);
  }

  try {
    await sendLoginEmail({
      success: !loginError,
      errorMessage: loginError ? loginError.message : "",
    });

    console.log("Email notification completed.");
  } catch (emailError) {
    console.error("Email notification failed:", emailError.message);

    if (loginError) {
      throw new Error(
        `Login failed: ${loginError.message}\nEmail also failed: ${emailError.message}`,
      );
    }

    throw emailError;
  }

  if (loginError) {
    throw loginError;
  }
});
