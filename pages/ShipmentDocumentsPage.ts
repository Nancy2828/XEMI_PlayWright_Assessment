import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
import logger from "../utils/Logger";

export default class ShipmentDocumentsPage extends BasePage {

    readonly documentsTab: Locator;
    readonly classifiedIcons: Locator;
    // readonly successIcons: Locator;
    // readonly processingIcons: Locator;

    constructor(page: Page) {
        super(page);

        this.documentsTab =
            page.locator("a[href='#documents-tab']");

        this.classifiedIcons =
            page.locator("img[src*='classified.png']");


    }

    async openDocumentsTab() {

        logger.info("Opening Documents Tab");

        await this.click(this.documentsTab);

    }
   async waitForClassification(
    documents: { fileName: string; expectedType: string }[]
) {

    logger.info("Waiting for document classification...");

    for (const document of documents) {

        logger.info(`Waiting for ${document.fileName}...`);

        const startTime = Date.now();
        let typeVerified = false;

        while (true) {

            const elapsedSeconds = (Date.now() - startTime) / 1000;

            if (elapsedSeconds > 60) {
                throw new Error(
                    `${document.fileName} did not complete processing within 60 seconds ` +
                    `(type classified: ${typeVerified}, data extracted: false).`
                );
            }

            const documentCard = this.page
                .locator(".document-collapse-box")
                .filter({
                    has: this.page.locator(".document-sub-title", {
                        hasText: document.fileName
                    })
                });

            if (await documentCard.count() > 0) {

                // Step 1: verify type classification (classified.png badge)
                if (!typeVerified) {
                    const classified = await documentCard
                        .locator("img[src*='classified.png']")
                        .count();

                    if (classified > 0) {
                        const actualType =
                            (await documentCard
                                .locator(".document-title h6")
                                .first()
                                .textContent())?.replace(/\s+/g, " ").trim() ?? "";

                        logger.info(
                            `${document.fileName}\nExpected : ${document.expectedType}\nActual   : ${actualType}`
                        );

                        expect(actualType).toContain(document.expectedType);
                        typeVerified = true;
                        logger.info(`${document.fileName} type classified correctly.`);
                    }
                }

                // Step 2: verify data extraction completed (successfully.png)
                if (typeVerified) {
                    const extracted = await documentCard
                        .locator(".status-icon img[src*='successfully.png']")
                        .count();

                    if (extracted > 0) {
                        logger.info(`${document.fileName} data extracted successfully.`);
                        break;
                    }
                }
            }

            await this.page.waitForTimeout(2000);
        }
    }

    logger.info("All uploaded documents classified and extracted successfully.");
}

}