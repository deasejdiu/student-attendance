const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config');

class SeleniumHelper {
  constructor() {
    this.driver = null;
  }

  async init() {
    const options = new chrome.Options();
    if (config.selenium.headless) {
      options.addArguments('--headless');
    }
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    this.driver = await new Builder()
      .forBrowser(config.selenium.browser)
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: config.selenium.implicitWait,
      pageLoad: config.selenium.timeout
    });
  }

  async quit() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  async navigateTo(path) {
    await this.driver.get(`${config.baseUrl}${path}`);
  }

  async waitForElement(selector, timeout = config.selenium.timeout) {
    return await this.driver.wait(
      until.elementLocated(By.css(selector)),
      timeout,
      `Element ${selector} not found after ${timeout}ms`
    );
  }

  async waitForElementVisible(selector, timeout = config.selenium.timeout) {
    const element = await this.waitForElement(selector, timeout);
    await this.driver.wait(
      until.elementIsVisible(element),
      timeout,
      `Element ${selector} not visible after ${timeout}ms`
    );
    return element;
  }

  async click(selector) {
    const element = await this.waitForElementVisible(selector);
    await element.click();
  }

  async type(selector, text) {
    const element = await this.waitForElementVisible(selector);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(selector) {
    const element = await this.waitForElementVisible(selector);
    return await element.getText();
  }

  async isElementPresent(selector) {
    try {
      await this.waitForElement(selector, 1000);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(username, password) {
    await this.navigateTo('/login');
    await this.type('input[name="username"]', username);
    await this.type('input[name="password"]', password);
    await this.click('button[type="submit"]');
    await this.waitForElementVisible('.dashboard-container');
  }

  async logout() {
    await this.click('.logout-button');
    await this.waitForElementVisible('.login-container');
  }
}

module.exports = SeleniumHelper; 