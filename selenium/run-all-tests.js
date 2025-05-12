const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('./config');

async function runAllTests() {
  console.log('Starting all CRUD tests...');
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

    // Login first
    await login(driver);

    // Run tests for each module
    await runUserTests(driver);
    await runStudentTests(driver);
    await runClassTests(driver);
    await runAttendanceTests(driver);
    await runReportTests(driver);

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

async function login(driver) {
  console.log('Logging in...');
  await driver.get(config.baseUrl + '/login');
  await driver.findElement(By.id('username')).sendKeys(config.adminCredentials.username);
  await driver.findElement(By.id('password')).sendKeys(config.adminCredentials.password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.elementLocated(By.css('h1')), 10000);
  console.log('Login successful');
}

async function runUserTests(driver) {
  console.log('\nRunning User CRUD tests...');
  
  // Navigate to users page
  await driver.get(config.baseUrl + '/users');
  await driver.wait(until.elementLocated(By.css('h1')), 10000);

  // Create user
  const timestamp = Date.now();
  const username = `testuser_${timestamp}`;
  const email = `testuser_${timestamp}@example.com`;

  // Click add user button
  const addButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Add User"]')), 10000);
  await driver.executeScript('arguments[0].click();', addButton);

  // Fill form
  const actions = driver.actions({ async: true });
  
  const usernameField = await driver.findElement(By.id('username'));
  await actions.move({ origin: usernameField }).click().perform();
  await usernameField.sendKeys(username);

  const emailField = await driver.findElement(By.id('email'));
  await actions.move({ origin: emailField }).click().perform();
  await emailField.sendKeys(email);

  const passwordField = await driver.findElement(By.id('password'));
  await actions.move({ origin: passwordField }).click().perform();
  await passwordField.sendKeys('password123');

  const roleSelect = await driver.findElement(By.id('role'));
  await actions.move({ origin: roleSelect }).click().perform();
  await roleSelect.sendKeys('Teacher', Key.RETURN);

  // Submit form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await driver.executeScript('arguments[0].click();', submitButton);

  // Wait for dialog to close
  await waitForDialogToClose(driver);

  // Verify user was created
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${username}')]`)), 10000);
  console.log('User created successfully');

  // Edit user
  const editButton = await driver.findElement(By.xpath(`//tr[contains(., '${username}')]//button[@aria-label="Edit"]`));
  await driver.executeScript('arguments[0].click();', editButton);

  const newEmail = `updated_${email}`;
  await emailField.clear();
  await emailField.sendKeys(newEmail);

  await driver.findElement(By.xpath("//button[contains(text(), 'Save Changes')]")).click();
  await waitForDialogToClose(driver);

  // Verify edit
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${newEmail}')]`)), 10000);
  console.log('User edited successfully');

  // Delete user
  const deleteButton = await driver.findElement(By.xpath(`//tr[contains(., '${newEmail}')]//button[@aria-label="Delete"]`));
  await driver.executeScript('arguments[0].click();', deleteButton);

  await driver.findElement(By.xpath("//button[contains(text(), 'Delete')]")).click();
  await waitForDialogToClose(driver);

  // Verify deletion
  const userExists = await checkElementExists(driver, By.xpath(`//td[contains(text(), '${newEmail}')]`));
  if (userExists) {
    throw new Error('User was not deleted');
  }
  console.log('User deleted successfully');
}

async function runStudentTests(driver) {
  console.log('\nRunning Student CRUD tests...');
  
  // Navigate to students page
  await driver.get(config.baseUrl + '/students');
  await driver.wait(until.elementLocated(By.css('h1')), 10000);

  // Create student
  const timestamp = Date.now();
  const studentId = `STU${timestamp}`;
  const firstName = `Test${timestamp}`;
  const lastName = `Student${timestamp}`;
  const email = `student_${timestamp}@example.com`;

  // Click add student button
  const addButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Add Student"]')), 10000);
  await driver.executeScript('arguments[0].click();', addButton);

  // Fill form
  const actions = driver.actions({ async: true });
  
  await driver.findElement(By.id('studentId')).sendKeys(studentId);
  await driver.findElement(By.id('firstName')).sendKeys(firstName);
  await driver.findElement(By.id('lastName')).sendKeys(lastName);
  await driver.findElement(By.id('email')).sendKeys(email);

  // Submit form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await driver.executeScript('arguments[0].click();', submitButton);

  // Wait for dialog to close
  await waitForDialogToClose(driver);

  // Verify student was created
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${studentId}')]`)), 10000);
  console.log('Student created successfully');

  // Edit student
  const editButton = await driver.findElement(By.xpath(`//tr[contains(., '${studentId}')]//button[@aria-label="Edit"]`));
  await driver.executeScript('arguments[0].click();', editButton);

  const newEmail = `updated_${email}`;
  await driver.findElement(By.id('email')).clear();
  await driver.findElement(By.id('email')).sendKeys(newEmail);

  await driver.findElement(By.xpath("//button[contains(text(), 'Save Changes')]")).click();
  await waitForDialogToClose(driver);

  // Verify edit
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${newEmail}')]`)), 10000);
  console.log('Student edited successfully');

  // Delete student
  const deleteButton = await driver.findElement(By.xpath(`//tr[contains(., '${newEmail}')]//button[@aria-label="Delete"]`));
  await driver.executeScript('arguments[0].click();', deleteButton);

  await driver.findElement(By.xpath("//button[contains(text(), 'Delete')]")).click();
  await waitForDialogToClose(driver);

  // Verify deletion
  const studentExists = await checkElementExists(driver, By.xpath(`//td[contains(text(), '${newEmail}')]`));
  if (studentExists) {
    throw new Error('Student was not deleted');
  }
  console.log('Student deleted successfully');
}

async function runClassTests(driver) {
  console.log('\nRunning Class CRUD tests...');
  
  // Navigate to classes page
  await driver.get(config.baseUrl + '/classes');
  await driver.wait(until.elementLocated(By.css('h1')), 10000);

  // Create class
  const timestamp = Date.now();
  const className = `Class${timestamp}`;
  const description = `Test class ${timestamp}`;

  // Click add class button
  const addButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Add Class"]')), 10000);
  await driver.executeScript('arguments[0].click();', addButton);

  // Fill form
  await driver.findElement(By.id('className')).sendKeys(className);
  await driver.findElement(By.id('description')).sendKeys(description);

  // Submit form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await driver.executeScript('arguments[0].click();', submitButton);

  // Wait for dialog to close
  await waitForDialogToClose(driver);

  // Verify class was created
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${className}')]`)), 10000);
  console.log('Class created successfully');

  // Edit class
  const editButton = await driver.findElement(By.xpath(`//tr[contains(., '${className}')]//button[@aria-label="Edit"]`));
  await driver.executeScript('arguments[0].click();', editButton);

  const newDescription = `Updated ${description}`;
  await driver.findElement(By.id('description')).clear();
  await driver.findElement(By.id('description')).sendKeys(newDescription);

  await driver.findElement(By.xpath("//button[contains(text(), 'Save Changes')]")).click();
  await waitForDialogToClose(driver);

  // Verify edit
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${newDescription}')]`)), 10000);
  console.log('Class edited successfully');

  // Delete class
  const deleteButton = await driver.findElement(By.xpath(`//tr[contains(., '${newDescription}')]//button[@aria-label="Delete"]`));
  await driver.executeScript('arguments[0].click();', deleteButton);

  await driver.findElement(By.xpath("//button[contains(text(), 'Delete')]")).click();
  await waitForDialogToClose(driver);

  // Verify deletion
  const classExists = await checkElementExists(driver, By.xpath(`//td[contains(text(), '${newDescription}')]`));
  if (classExists) {
    throw new Error('Class was not deleted');
  }
  console.log('Class deleted successfully');
}

async function runAttendanceTests(driver) {
  console.log('\nRunning Attendance CRUD tests...');
  
  // Navigate to attendance page
  await driver.get(config.baseUrl + '/attendance');
  await driver.wait(until.elementLocated(By.css('h1')), 10000);

  // Create attendance record
  const timestamp = Date.now();
  const date = new Date().toISOString().split('T')[0];

  // Click add attendance button
  const addButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Add Attendance"]')), 10000);
  await driver.executeScript('arguments[0].click();', addButton);

  // Fill form
  await driver.findElement(By.id('date')).sendKeys(date);
  await driver.findElement(By.id('status')).sendKeys('Present', Key.RETURN);

  // Submit form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await driver.executeScript('arguments[0].click();', submitButton);

  // Wait for dialog to close
  await waitForDialogToClose(driver);

  // Verify attendance was created
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), '${date}')]`)), 10000);
  console.log('Attendance record created successfully');

  // Edit attendance
  const editButton = await driver.findElement(By.xpath(`//tr[contains(., '${date}')]//button[@aria-label="Edit"]`));
  await driver.executeScript('arguments[0].click();', editButton);

  await driver.findElement(By.id('status')).sendKeys('Absent', Key.RETURN);

  await driver.findElement(By.xpath("//button[contains(text(), 'Save Changes')]")).click();
  await waitForDialogToClose(driver);

  // Verify edit
  await driver.wait(until.elementLocated(By.xpath(`//td[contains(text(), 'Absent')]`)), 10000);
  console.log('Attendance record edited successfully');

  // Delete attendance
  const deleteButton = await driver.findElement(By.xpath(`//tr[contains(., 'Absent')]//button[@aria-label="Delete"]`));
  await driver.executeScript('arguments[0].click();', deleteButton);

  await driver.findElement(By.xpath("//button[contains(text(), 'Delete')]")).click();
  await waitForDialogToClose(driver);

  // Verify deletion
  const attendanceExists = await checkElementExists(driver, By.xpath(`//td[contains(text(), 'Absent')]`));
  if (attendanceExists) {
    throw new Error('Attendance record was not deleted');
  }
  console.log('Attendance record deleted successfully');
}

async function runReportTests(driver) {
  console.log('\nRunning Report tests...');
  
  // Navigate to reports page
  await driver.get(config.baseUrl + '/reports');
  await driver.wait(until.elementLocated(By.css('h1')), 10000);

  // Generate report
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();

  await driver.findElement(By.id('startDate')).sendKeys(startDate.toISOString().split('T')[0]);
  await driver.findElement(By.id('endDate')).sendKeys(endDate.toISOString().split('T')[0]);

  const generateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Generate Report')]"));
  await driver.executeScript('arguments[0].click();', generateButton);

  // Wait for report to generate
  await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Report generated successfully')]")), 10000);
  console.log('Report generated successfully');

  // Export report
  const exportButton = await driver.findElement(By.xpath("//button[contains(text(), 'Export')]"));
  await driver.executeScript('arguments[0].click();', exportButton);

  // Wait for export to complete
  await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Report exported successfully')]")), 10000);
  console.log('Report exported successfully');
}

async function waitForDialogToClose(driver) {
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
    throw new Error('Dialog did not close');
  }
}

async function checkElementExists(driver, locator) {
  try {
    await driver.findElement(locator);
    return true;
  } catch (err) {
    return false;
  }
}

runAllTests().catch(console.error); 