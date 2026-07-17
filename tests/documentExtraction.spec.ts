
import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import ShipmentPage from "../pages/ShipmentPage";
import ShipmentOverviewPage from "../pages/ShipmentOverviewPage";

import { config } from "../config/config";
import FailureHandler from "../utils/FailureHandler";
import logger from "../utils/Logger";

test.describe("Document Extraction Validation", () => {

    test("Validate extracted document fields", async ({ page }) => {

        test.setTimeout(120000);

        try {

            logger.info("Starting Document Extraction Validation");

            const loginPage = new LoginPage(page);
            const shipmentPage = new ShipmentPage(page);
            const shipmentOverviewPage =
                new ShipmentOverviewPage(page);

            // Login
            await loginPage.login(
                config.username,
                config.password
            );

            // Open Shipment Details
            await shipmentPage.openShipmentDetails();

            // Open Overview Tab
            await shipmentOverviewPage.openOverviewTab();
            await expect(
                page.locator("#overview-tab")
            ).toBeVisible();

            logger.info("Overview tab loaded successfully.");

            // Validate Extracted Fields
            await shipmentOverviewPage.validateOverviewData();

            logger.info("Document Extraction Validation Completed");

        } catch (error) {

            await FailureHandler.captureFailure(
                page,
                "DocumentExtraction",
                error
            );

            throw error;

        }

    });

});