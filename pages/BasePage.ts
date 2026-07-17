import { Page, Locator, expect } from "@playwright/test";

export default class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async fill(locator: Locator, value: string) {
    await locator.fill(value);
  }

  async getText(locator: Locator) {
    return await locator.textContent();
  }

  async isVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }
}