import { test } from "@playwright/test";

import LoginPage from "../pages/LoginPage";
import ShipmentPage from "../pages/ShipmentPage";
import ShipmentDocumentsPage from "../pages/ShipmentDocumentsPage";

import { config } from "../config/config";
import { shipmentData } from "../test-data/shipmentData";
import { documentData } from "../test-data/documentData";
import FailureHandler from "../utils/FailureHandler";

import logger from "../utils/Logger";

test.describe("Document Classification Validation", () => {

    test("Validate uploaded documents are classified correctly", async ({ page }) => {

        test.setTimeout(180_000);

        try {

            logger.info("Starting Document Classification Test");

            const loginPage = new LoginPage(page);
            const shipmentPage = new ShipmentPage(page);
            const shipmentDocumentsPage = new ShipmentDocumentsPage(page);

            // Login
            await loginPage.login(
                config.username,
                config.password
            );

            // Create Shipment with Documents
            await shipmentPage.createShipmentWithDocuments(
                shipmentData.shipmentType,
                shipmentData.transportMode,
                shipmentData.referenceNumber,
                documentData.map(doc => doc.filePath)
            );

            logger.info("Documents uploaded successfully");

            await shipmentPage.waitForShipmentDocumentResponse();

            await shipmentPage.openShipmentDetails();

            await shipmentDocumentsPage.openDocumentsTab();

            await shipmentDocumentsPage.waitForClassification(
                documentData
            );

            logger.info("Document Classification Completed");

        } catch (error) {

            await FailureHandler.captureFailure(
                page,
                "DocumentClassification",
                error
            );

            throw error;

        }

    });

});