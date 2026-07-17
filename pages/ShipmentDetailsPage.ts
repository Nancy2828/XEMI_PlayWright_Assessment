import { expect, Page } from "@playwright/test";
import BasePage from "./BasePage";
import logger from "../utils/Logger";

export default class ShipmentDetailsPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    /**
     * Returns the value (<h6>) corresponding to a label (<p>)
     */
    async getFieldValue(label: string, timeout = 90000): Promise<string> {

    const field = this.page
        .locator("div.col-2")
        .filter({
            has: this.page.locator("p", { hasText: label })
        });

    const valueLocator = field.locator("h6").first();

    logger.info(`Waiting for ${label} value to be populated...`);

    await expect.poll(
        async () => ((await valueLocator.textContent()) ?? "").trim(),
        {
            timeout,
            intervals: [1000, 2000, 5000], // check faster at first, then back off
            message: `${label} was not populated within ${timeout / 1000} seconds`
        }
    ).not.toBe("-");

    const value = (await valueLocator.textContent())?.trim() ?? "";
    logger.info(`${label} loaded: ${value}`);
    return value;
}

    /**
     * Validates all expected shipment fields
     */
    async validateShipmentDetails(expectedData: Record<string, string>) {

        logger.info("Validating Shipment Details");

        for (const [label, expectedValue] of Object.entries(expectedData)) {

            const actualValue = await this.getFieldValue(label);

            logger.info(
                `${label} -> Expected: ${expectedValue} | Actual: ${actualValue}`
            );

            expect(actualValue).toBe(expectedValue);

        }

        logger.info("Shipment Details Validation Completed");

    }

}