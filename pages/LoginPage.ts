import { Page, Locator } from "@playwright/test";
import BasePage from "./BasePage";
import { config } from "../config/config";
import logger from "../utils/Logger";

export default class LoginPage extends BasePage {

    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        super(page);

        this.emailInput = page.locator("#email");
        this.passwordInput = page.locator("#password");
        this.loginButton = page.getByRole("button", { name: "Login" });
    }

    async openLoginPage() {
        logger.info("Opening Login Page");
        await this.navigate(config.baseURL);
    }

    async enterUsername(username: string) {
        logger.info("Entering Username");
        await this.fill(this.emailInput, username);
    }

    async enterPassword(password: string) {
        logger.info("Entering Password");
        await this.fill(this.passwordInput, password);
    }

    async clickLogin() {
        logger.info("Clicking Login");
        await this.click(this.loginButton);
    }

    async login(username: string, password: string) {
        await this.openLoginPage();
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

}