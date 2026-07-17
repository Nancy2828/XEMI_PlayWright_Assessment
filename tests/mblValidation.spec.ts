import { test } from "@playwright/test";

import LoginPage from "../pages/LoginPage";
import ShipmentPage from "../pages/ShipmentPage";
import ShipmentDetailsPage from "../pages/ShipmentDetailsPage";

import { config } from "../config/config";
import { shipmentData } from "../test-data/shipmentData";
import { expectedShipmentData } from "../test-data/expectedShipmentData";

import logger from "../utils/Logger";

test.describe("MBL Enquiry Validation", () => {

    test("Verify MBL enquiry returns shipment details", async ({ page }) => {

        logger.info("Starting MBL Validation Test");

        const loginPage = new LoginPage(page);
        const shipmentPage = new ShipmentPage(page);
        const shipmentDetailsPage = new ShipmentDetailsPage(page);

        await loginPage.login(
            config.username,
            config.password
        );

        await shipmentPage.createShipment(
            shipmentData.shipmentType,
            shipmentData.transportMode,
            shipmentData.referenceNumber,
            shipmentData.mblNumber
        );

        logger.info("Shipment Created Successfully");

        // Wait until MBL & HBL values are populated
        await shipmentPage.waitForShipmentResponse();

        // Open Shipment Details
        await shipmentPage.openShipmentDetails();

        // Validate
        await shipmentDetailsPage.validateShipmentDetails(
            expectedShipmentData
        );
        logger.info("MBL Validation Completed Successfully");

    });

});