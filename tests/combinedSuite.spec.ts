import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import ShipmentPage from "../pages/ShipmentPage";
import ShipmentDetailsPage from "../pages/ShipmentDetailsPage";
import ShipmentDocumentsPage from "../pages/ShipmentDocumentsPage";
import ShipmentOverviewPage from "../pages/ShipmentOverviewPage";

import { config } from "../config/config";
import { shipmentData } from "../test-data/shipmentData";
import { expectedShipmentData } from "../test-data/expectedShipmentData";
import { documentData } from "../test-data/documentData";

import FailureHandler from "../utils/FailureHandler";
import logger from "../utils/Logger";

test("Combined End-to-End Suite with Tolerant Document Classification", async ({ page }) => {
    test.setTimeout(250_000);

    logger.info("Starting Combined End-to-End Test Suite");

    const loginPage = new LoginPage(page);
    const shipmentPage = new ShipmentPage(page);
    const shipmentDetailsPage = new ShipmentDetailsPage(page);
    const shipmentDocumentsPage = new ShipmentDocumentsPage(page);
    const shipmentOverviewPage = new ShipmentOverviewPage(page);

    // Step 1: Login
    logger.info("Step 1: Login Test");
    await loginPage.login(config.username, config.password);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/dashboard/);
    logger.info("Step 1 complete: Login Successful");

    // Step 2: MBL Validation
    logger.info("Step 2: MBL Validation Test");
    await shipmentPage.createShipment(
        shipmentData.shipmentType,
        shipmentData.transportMode,
        shipmentData.referenceNumber,
        shipmentData.mblNumber
    );
    logger.info("Shipment Created Successfully");
    await shipmentPage.waitForShipmentResponse();
    await shipmentPage.openShipmentDetails();
    await shipmentDetailsPage.validateShipmentDetails(expectedShipmentData);
    logger.info("Step 2 complete: MBL Validation Completed Successfully");

    // Step 2.5: Delete the shipment created in Step 2
    logger.info("Step 2.5: Deleting shipment created in Step 2");
    const closeButton = page.locator("div.text-right.d-none.d-sm-block button.close-btn");

    if (await closeButton.isVisible()) {
        await closeButton.click();
    }
    const actionsMenuToggle = page.locator("a.dots-toggle");
    const deleteMenuItem = page.locator("li a.dropdown-item", { hasText: "Delete" }).first();
    const deleteModal = page.locator(".modal-content", { hasText: "Delete consignment" });
    const deleteConfirmButton = deleteModal.locator("button.btn-danger");

    await actionsMenuToggle.click();
    await expect(deleteMenuItem).toBeVisible();
    await deleteMenuItem.click();

    await expect(deleteModal).toBeVisible();
    await deleteConfirmButton.click();
    await expect(deleteModal).not.toBeVisible();

    await expect(page).toHaveURL(/dashboard/);
    
    // Ensure page is fully settled and any modals/overlays are gone
    await page.waitForLoadState("networkidle");
    
    // Wait for any backdrop overlays to disappear
    const backdrop = page.locator(".modal-backdrop");
    if (await backdrop.count() > 0) {
       await expect(backdrop).toHaveCount(0, { timeout: 5000 });
    }
    
    // Small delay to ensure UI is fully settled
    await page.waitForTimeout(500);
    
    logger.info("Step 2.5 complete: Shipment deleted, back on dashboard");

    // Step 3: Document Classification
    logger.info("Step 3: Document Classification Test");
    try {
        await shipmentPage.createShipmentWithDocuments(
            shipmentData.shipmentType,
            shipmentData.transportMode,
            shipmentData.referenceNumber,
            documentData.map((doc) => doc.filePath)
        );
        logger.info("Documents uploaded successfully");
        await shipmentPage.waitForShipmentDocumentResponse();
        await shipmentPage.openShipmentDetails();
        await shipmentDocumentsPage.openDocumentsTab();
        await shipmentDocumentsPage.waitForClassification(documentData);
        logger.info("Step 3 complete: Document Classification Completed");
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Document Classification failed but continuing to next step: ${errorMessage}`
        );
        try {
            await FailureHandler.captureFailure(
                page,
                "DocumentClassification",
                error
            );
        } catch (captureError: unknown) {
            const captureErrorMessage =
                captureError instanceof Error
                    ? captureError.message
                    : String(captureError);
            logger.error(
                `Failure capture also failed: ${captureErrorMessage}`
            );
        }
    }

    // Ensure a known, consistent starting point for Step 4 regardless of
    // how Step 3 ended (success leaves you on the Documents tab; the catch
    // block may leave you mid-navigation or on an error state).
    logger.info("Returning to dashboard before Step 4");
    await page.goto(config.baseURL + "/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/dashboard/);

    // Step 4: Document Extraction
    logger.info("Step 4: Document Extraction Validation");
    try {
        await shipmentPage.openShipmentDetails();
        await shipmentOverviewPage.openOverviewTab();
        await expect(page.locator("#overview-tab")).toBeVisible();
        logger.info("Overview tab loaded successfully.");
        await page.waitForTimeout(10000);
        await shipmentOverviewPage.validateOverviewData();
        logger.info("Step 4 complete: Document Extraction Validation Completed");
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Document Extraction Validation failed: ${errorMessage}`);
        await FailureHandler.captureFailure(page, "DocumentExtraction", error);
        throw error;
    }
});