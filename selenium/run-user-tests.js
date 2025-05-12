const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('./config');

async function runUserTests() {
  console.log('Starting user tests...');
  let driver;

  try {
    // Setup Chrome options
    const options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-popup-blocking');

    // Initialize driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: 10000 });

    // Navigate to login page
    console.log('Navigating to login page...');
    await driver.get(config.baseUrl + '/login');

    // Login
    console.log('Entering credentials...');
    await driver.findElement(By.id('username')).sendKeys(config.testCredentials.admin.username);
    await driver.findElement(By.id('password')).sendKeys(config.testCredentials.admin.password);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait for dashboard to load
    console.log('Waiting for dashboard to load...');
    await driver.wait(until.elementLocated(By.css('h1')), 10000);

    // Navigate to users page
    console.log('Navigating to users page...');
    await driver.get(config.baseUrl + '/users');
    await driver.wait(until.elementLocated(By.css('h1')), 10000);

    // Click add user button
    console.log('Clicking add user button...');
    const addButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Add User"]')), 10000);
    await driver.executeScript('arguments[0].click();', addButton);

    // Wait for dialog to open
    console.log('Waiting for dialog to open...');
    await driver.wait(until.elementLocated(By.css('div[role="dialog"]')), 10000);

    // Generate unique username and email
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    const email = `testuser_${timestamp}@example.com`;

    // Fill out form using Actions API
    console.log('Filling out form...');
    const actions = driver.actions({ async: true });

    // Username
    const usernameField = await driver.findElement(By.id('username'));
    await actions.move({ origin: usernameField }).click().perform();
    await usernameField.sendKeys(username);

    // Email
    const emailField = await driver.findElement(By.id('email'));
    await actions.move({ origin: emailField }).click().perform();
    await emailField.sendKeys(email);

    // Password
    const passwordField = await driver.findElement(By.id('password'));
    await actions.move({ origin: passwordField }).click().perform();
    await passwordField.sendKeys('password123');

    // Role
    const roleSelect = await driver.findElement(By.id('role'));
    await actions.move({ origin: roleSelect }).click().perform();
    await roleSelect.sendKeys('Teacher', Key.RETURN);

    // Log form values for debugging
    console.log('Form values:', {
      username: await usernameField.getAttribute('value'),
      email: await emailField.getAttribute('value'),
      password: await passwordField.getAttribute('value'),
      role: await roleSelect.getAttribute('value')
    });

    // Check if submit button is enabled
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    const isEnabled = await submitButton.isEnabled();
    console.log('Submit button enabled:', isEnabled);

    if (!isEnabled) {
      throw new Error('Submit button is not enabled');
    }

    // Submit form
    console.log('Submitting form...');
    await driver.executeScript('arguments[0].click();', submitButton);

    // Wait for dialog to close
    console.log('Waiting for dialog to close...');
    let dialogClosed = false;
    for (let i = 0; i < 10; i++) {
      try {
        const dialog = await driver.findElement(By.css('div[role="dialog"]'));
        const isDisplayed = await dialog.isDisplayed();
        if (!isDisplayed) {
          dialogClosed = true;
          break;
        }
      } catch (err) {
        dialogClosed = true;
        break;
      }
      await driver.sleep(1000);
    }

    if (!dialogClosed) {
      throw new Error('Dialog did not close after form submission');
    }

    // Verify new user appears in table
    console.log('Verifying new user in table...');
    await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${username}')]`)), 10000);

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runUserTests().catch(console.error); 