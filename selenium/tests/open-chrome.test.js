const { Builder } = require('selenium-webdriver');
const config = require('../config');

describe('Open Chrome Test', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser(config.selenium.browser)
      .build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('should open Chrome and wait 5 seconds', async () => {
    await driver.get(config.baseUrl);
    await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
  });
}); 