import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export default class FailureHandler {

    static async captureFailure(
        page: Page,
        testName: string,
        error: any
    ) {

        // Create timestamp
        const timestamp = new Date()
            .toISOString()
            .replace(/:/g, "-");

        // Create folders if they don't exist
        fs.mkdirSync("TestFailed/Screenshots", { recursive: true });
        fs.mkdirSync("TestFailed/Errors", { recursive: true });
        fs.mkdirSync("TestFailed/HTML", { recursive: true });

        // ===========================
        // Screenshot
        // ===========================

        const screenshotPath = path.join(
            "TestFailed",
            "Screenshots",
            `${testName}_${timestamp}.png`
        );

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        // ===========================
        // HTML Source
        // ===========================

        const htmlPath = path.join(
            "TestFailed",
            "HTML",
            `${testName}_${timestamp}.html`
        );

        fs.writeFileSync(
            htmlPath,
            await page.content()
        );

        // ===========================
        // Error Report
        // ===========================

        const errorPath = path.join(
            "TestFailed",
            "Errors",
            `${testName}_${timestamp}.txt`
        );

        const errorContent = `
==========================================
TEST FAILED
==========================================

Test Name:
${testName}

Date & Time:
${new Date().toLocaleString()}

------------------------------------------
Error Message
------------------------------------------

${error?.message ?? "No error message available"}

------------------------------------------
Stack Trace
------------------------------------------

${error?.stack ?? "No stack trace available"}

==========================================
Failure Evidence Generated Successfully
==========================================
`;

        fs.writeFileSync(errorPath, errorContent);

        // ===========================
        // Console Output
        // ===========================

        console.log(`
==========================================
Failure Evidence Saved Successfully
==========================================

Screenshot :
${screenshotPath}

HTML :
${htmlPath}

Error Log :
${errorPath}

==========================================
`);
    }
}