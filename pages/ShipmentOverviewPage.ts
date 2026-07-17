import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
import logger from "../utils/Logger";
import { overviewData } from "../test-data/overviewData";

export default class ShipmentOverviewPage extends BasePage {

    readonly overviewTab: Locator;
    readonly overviewPanel: Locator;

    // Shipment Details
    readonly hblNumber: Locator;
    readonly hblDate: Locator;
    readonly pol: Locator;
    readonly pod: Locator;

    // Order Details
    readonly invoiceNumber: Locator;
    readonly invoiceDate: Locator;
    readonly invoiceValue: Locator;
    readonly supplierName: Locator;
    readonly supplierCountry: Locator;
    readonly supplierAddress: Locator;
    readonly description: Locator;

    constructor(page: Page) {

        super(page);

        this.overviewTab =
            page.getByRole("link", { name: "Overview" });

        this.overviewPanel =
            page.locator("#overview-tab");

        //---------------- Shipment Details ----------------//
        const hblBlock = this.overviewPanel.locator(
                ".overview-top-details .row:first-child .col-2"
            ).filter({
                hasText: "HBL"
            });

this.hblNumber = hblBlock.locator("h6");

        this.hblDate =
            hblBlock.locator("span.date-blue");

        this.pol =
            this.overviewPanel
                .locator("p:has-text('POL')")
                .locator("..")
                .locator("..")
                .locator("h6");

        this.pod =
            this.overviewPanel
                .locator("p:has-text('POD')")
                .locator("..")
                .locator("..")
                .locator("h6");

        //---------------- Order Details ----------------//

        const invoiceBlock = this.overviewPanel
    .locator("div.col-lg-3")
    .filter({
        has: this.page.getByText("INVOICE", { exact: true })
    })
    .first();

        this.invoiceNumber = invoiceBlock.locator("h6");
        this.invoiceDate = invoiceBlock.locator("span.date-blue");

        this.invoiceValue =
            this.overviewPanel
                .locator("p:text-is('INVOICE VALUE')")
                .locator("xpath=../following-sibling::h6");

        this.supplierName =
            this.overviewPanel
                .locator("p:text-is('SUPPLIER NAME')")
                .locator("xpath=../following-sibling::h6");

        this.supplierCountry =
            this.overviewPanel
                .locator("p:text-is('SUPPLIER COUNTRY')")
                .locator("xpath=../following-sibling::h6");

        this.supplierAddress =
            this.overviewPanel
                .locator("p:text-is('SUPPLIER ADDRESS')")
                .locator("xpath=../following-sibling::h6")
                .first();

        const descriptionSection =
            this.overviewPanel
                .locator("div.col-lg-9")
                .filter({
                    has: this.overviewPanel.locator("p", {
                        hasText: "DESCRIPTION OF GOODS"
                    })
                });

        this.description =
            descriptionSection.locator("h6");
    }

    async openOverviewTab() {

        logger.info("Opening Overview Tab");

        await this.click(this.overviewTab);

        await expect(this.overviewPanel).toBeVisible();

        logger.info("Overview Tab Opened");
    }

    /**
     * Reads a field's text content and logs it. Fields are expected to
     * already be rendered by the time this is called - no polling/waiting.
     */
    private async getValue(locator: Locator, label: string): Promise<string> {

        const value = ((await locator.textContent()) ?? "").trim();
        logger.info(`${label}: ${value}`);
        return value;
    }

    async validateOverviewData() {

        logger.info("========== Shipment Details ==========");

        const hblValue = await this.getValue(this.hblNumber, "HBL Number");
        expect(hblValue).not.toBe("");
        expect(hblValue).not.toBe("-");

        const hblDateValue = await this.getValue(this.hblDate, "HBL Date");
        expect(hblDateValue).toContain(overviewData.shipmentDetails.hblDate);

        // const polValue = await this.getValue(this.pol, "POL");
        // expect(polValue).not.toBe("");
        // expect(polValue).not.toBe("-");

        const podValue = await this.getValue(this.pod, "POD");
        expect(podValue).toContain(overviewData.shipmentDetails.pod);

        logger.info("Shipment Details Validated Successfully.");
        logger.info("========== Order Details ==========");

        // Invoice Number
        const invoiceNumberValue = await this.getValue(this.invoiceNumber, "Invoice Number");
        expect(invoiceNumberValue).toBe(overviewData.orderDetails.invoiceNumber);

        // Invoice Date
        const invoiceDateValue = await this.getValue(this.invoiceDate, "Invoice Date");
        expect(invoiceDateValue).toBe(overviewData.orderDetails.invoiceDate);

        // Invoice Value
        const invoiceValue = await this.getValue(this.invoiceValue, "Invoice Value");
        expect(invoiceValue).toContain(overviewData.orderDetails.invoiceAmount);
        expect(invoiceValue).toContain(overviewData.orderDetails.currency);

        // Supplier Name
        const supplierNameValue = await this.getValue(this.supplierName, "Supplier Name");
        expect(supplierNameValue).toBe(overviewData.orderDetails.supplierName);

        // Supplier Country
        const supplierCountryValue = await this.getValue(this.supplierCountry, "Supplier Country");
        expect(supplierCountryValue).toBe(overviewData.orderDetails.supplierCountry);

        // Supplier Address
        const supplierAddressValue = await this.getValue(this.supplierAddress, "Supplier Address");
        expect(supplierAddressValue).toContain(overviewData.orderDetails.supplierAddress);

        logger.info("Order Details Validated Successfully.");
        logger.info("========== Overview Validation Completed ==========");
    }
}