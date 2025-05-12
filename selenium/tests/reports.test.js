const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Reports Tests', () => {
  let selenium;

  beforeAll(async () => {
    selenium = new SeleniumHelper();
    await selenium.init();
    await selenium.login(
      config.adminCredentials.username,
      config.adminCredentials.password
    );
  });

  afterAll(async () => {
    await selenium.quit();
  });

  beforeEach(async () => {
    await selenium.navigateTo('/reports');
  });

  test('should display reports dashboard', async () => {
    const reportsDashboard = await selenium.waitForElementVisible('.reports-dashboard');
    expect(reportsDashboard).toBeTruthy();
  });

  test('should generate attendance report', async () => {
    await selenium.click('.generate-attendance-report');
    
    await selenium.type('input[name="startDate"]', '2024-03-01');
    await selenium.type('input[name="endDate"]', '2024-03-31');
    await selenium.click('.class-select option:nth-child(2)');
    
    await selenium.click('.generate-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should generate student report', async () => {
    await selenium.click('.generate-student-report');
    
    await selenium.type('input[name="studentId"]', '12345');
    await selenium.type('input[name="startDate"]', '2024-03-01');
    await selenium.type('input[name="endDate"]', '2024-03-31');
    
    await selenium.click('.generate-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should generate class report', async () => {
    await selenium.click('.generate-class-report');
    
    await selenium.click('.class-select option:nth-child(2)');
    await selenium.type('input[name="startDate"]', '2024-03-01');
    await selenium.type('input[name="endDate"]', '2024-03-31');
    
    await selenium.click('.generate-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should download report', async () => {
    const downloadButton = await selenium.waitForElementVisible('.download-report:first-child');
    await downloadButton.click();
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should filter reports by date range', async () => {
    await selenium.type('input[name="startDate"]', '2024-03-01');
    await selenium.type('input[name="endDate"]', '2024-03-31');
    await selenium.click('.filter-button');
    
    const reportsList = await selenium.waitForElementVisible('.reports-list');
    expect(reportsList).toBeTruthy();
  });

  test('should view report details', async () => {
    const viewButton = await selenium.waitForElementVisible('.view-report:first-child');
    await viewButton.click();
    
    const reportDetails = await selenium.waitForElementVisible('.report-details');
    expect(reportDetails).toBeTruthy();
  });
}); 