import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import { config } from "../config/config";
import logger from "../utils/Logger";

test.describe("Login Tests", () => {

    test("User should login successfully", async ({ page }) => {

        logger.info("Starting Login Test");

        const loginPage = new LoginPage(page);

        await loginPage.login(
            config.username,
            config.password
        );

        // Wait until dashboard loads
        await page.waitForLoadState("networkidle");

        // Verify successful login
        await expect(page).toHaveURL(/dashboard/);

        logger.info("Login Successful");

    });

});