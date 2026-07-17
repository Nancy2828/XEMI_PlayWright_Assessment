import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
import logger from "../utils/Logger";

export default class ShipmentPage extends BasePage {

    // ============================
    // Locators
    // ============================

    readonly addShipmentButton: Locator;
    readonly shipmentTypeImport: Locator;
    readonly transportModeSea: Locator;
    readonly referenceNumber: Locator;
    readonly mblNumber: Locator;
    readonly continueButton: Locator;
    readonly shipmentDetailsArrow: Locator;
    // readonly uploadDocumentsButton: Locator;
    readonly uploadFileInput: Locator;
    readonly uploadContinueButton: Locator;
    readonly shipmentCardMBL: Locator;
readonly shipmentCardHBL: Locator;

    constructor(page: Page) {
        super(page);

        this.addShipmentButton =
    page.locator("li.add-shipment a");

        this.shipmentTypeImport =
            page.getByText("Import", { exact: true });

        this.transportModeSea =
            page.getByText("Sea", { exact: true });

        this.referenceNumber =
            page.locator("[formcontrolname='job_number']");

        this.mblNumber =
            page.locator("#bl_number");

        this.continueButton =
            page.getByRole("button", { name: "Continue" });

        this.shipmentDetailsArrow =
            page.locator(".mat-tooltip-trigger.right-arrow");

        // this.uploadDocumentsButton =
        //     page.getByText("Upload Documents", { exact: true });

        this.uploadFileInput =
    page
        .locator(".modal-content")
        .filter({ has: page.locator("h5.modal-title", { hasText: "Add Shipment" }) })
        .locator("ngx-dropzone#uploadFiles input[type='file']");

this.uploadContinueButton =
    page
        .locator(".modal-content")
        .filter({ has: page.locator("h5.modal-title", { hasText: "Add Shipment" }) })
        .locator("button.blue-bg-btn", { hasText: "Continue" });
           this.shipmentCardMBL = page
    .locator("p:has-text('MBL')")
    .locator("xpath=following-sibling::div//div[contains(@class,'ship-number')]");

this.shipmentCardHBL = page
    .locator("p:has-text('HBL')")
    .locator("xpath=following-sibling::h6");
    }

    // ============================
    // Methods
    // ============================

    async clickAddShipment() {
        logger.info("Clicking Add Shipment");
        await this.click(this.addShipmentButton);
    }

    async selectShipmentType(type: string) {

    logger.info(`Selecting Shipment Type : ${type}`);

    const dialogLocator = this.page
        .locator(".modal-content")
        .filter({ has: this.page.locator("h5.modal-title", { hasText: "Add Shipment" }) });

    await expect(dialogLocator).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState("networkidle");

    const typeElement = dialogLocator.locator(".top-applied-filters-list", { hasText: type });
    await expect(typeElement).toBeVisible({ timeout: 5000 });
    await typeElement.click();
}

async selectTransportMode(mode: string) {

    logger.info(`Selecting Transport Mode : ${mode}`);

    const dialogLocator = this.page
        .locator(".modal-content")
        .filter({ has: this.page.locator("h5.modal-title", { hasText: "Add Shipment" }) });

    const modeElement = dialogLocator.locator(".top-applied-filters-list", { hasText: mode });
    await expect(modeElement).toBeVisible({ timeout: 5000 });
    await modeElement.click();
}

    async enterReferenceNumber(referenceNumber: string) {
        logger.info(`Entering Reference Number : ${referenceNumber}`);
        await this.fill(this.referenceNumber, referenceNumber);
    }

    // async clickUploadDocuments() {

    //     logger.info("Clicking Upload Documents");
    //     await this.click(this.uploadDocumentsButton);
    // }
    async uploadDocuments(filePaths: string[]) {

        logger.info("Uploading Documents");
        await this.uploadFileInput.setInputFiles(filePaths);

    }
    async clickUploadContinue() {
        logger.info("Clicking Continue after document upload");
        await this.click(this.uploadContinueButton);
    }
    async enterMBLNumber(mblNumber: string) {
        logger.info(`Entering MBL Number : ${mblNumber}`);
        await this.fill(this.mblNumber, mblNumber);
    }

    async clickContinue() {
        logger.info("Clicking Continue");
        await this.click(this.continueButton);
    }
    async waitForShipmentResponse() {

    logger.info("Waiting for shipment enquiry to complete...");

    // Wait until MBL is populated (maximum 30 seconds)
    await expect(this.shipmentCardMBL).not.toHaveText("", {
        timeout: 30000
    });

    // Wait until HBL is populated (maximum 30 seconds)
    await expect(this.shipmentCardHBL).not.toHaveText("", {
        timeout: 30000
    });

    logger.info("Shipment enquiry completed successfully.");

}
async waitForShipmentDocumentResponse() {

    logger.info("Waiting for shipment enquiry to complete...");

    // // Wait until MBL is populated (maximum 30 seconds)
    // await expect(this.shipmentCardMBL).not.toHaveText("", {
    //     timeout: 30000
    // });

    // Wait until HBL is populated (maximum 30 seconds)
    await expect(this.shipmentCardHBL).not.toHaveText("", {
        timeout: 30000
    });

    logger.info("Shipment enquiry completed successfully.");

}

    async openShipmentDetails() {

        logger.info("Opening Shipment Details");

        await this.click(this.shipmentDetailsArrow);

    }
    async createShipment(shipmentType: string, transportMode: string, referenceNumber: string, mblNumber: string) {
        await this.clickAddShipment();
        await this.selectShipmentType(shipmentType);
        await this.selectTransportMode(transportMode);
        await this.enterReferenceNumber(referenceNumber);
        await this.enterMBLNumber(mblNumber);
        await this.clickContinue();
    }
    async createShipmentWithDocuments(
        shipmentType: string,
        transportMode: string,
        referenceNumber: string,
        filePaths: string[]
    ) {

        logger.info("Creating Shipment with Documents");

        await this.clickAddShipment();

        await this.selectShipmentType(shipmentType);

        await this.selectTransportMode(transportMode);

        await this.enterReferenceNumber(referenceNumber);

        // await this.clickUploadDocuments();

        await this.uploadDocuments(filePaths);

        await this.clickContinue();

    }

}