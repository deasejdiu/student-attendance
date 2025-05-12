const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Attendance Tests', () => {
  let selenium;

  beforeAll(async () => {
    selenium = new SeleniumHelper();
    await selenium.init();
    await selenium.login(
      config.teacherCredentials.username,
      config.teacherCredentials.password
    );
  });

  afterAll(async () => {
    await selenium.quit();
  });

  beforeEach(async () => {
    await selenium.navigateTo('/attendance');
  });

  test('should display attendance list', async () => {
    const attendanceList = await selenium.waitForElementVisible('.attendance-list');
    expect(attendanceList).toBeTruthy();
  });

  test('should mark student as present', async () => {
    const studentRow = await selenium.waitForElementVisible('.student-row:first-child');
    const presentButton = await studentRow.findElement(By.css('.mark-present'));
    await presentButton.click();
    
    const status = await selenium.getText('.student-row:first-child .status');
    expect(status).toContain('Present');
  });

  test('should mark student as absent', async () => {
    const studentRow = await selenium.waitForElementVisible('.student-row:first-child');
    const absentButton = await studentRow.findElement(By.css('.mark-absent'));
    await absentButton.click();
    
    const status = await selenium.getText('.student-row:first-child .status');
    expect(status).toContain('Absent');
  });

  test('should mark student as late', async () => {
    const studentRow = await selenium.waitForElementVisible('.student-row:first-child');
    const lateButton = await studentRow.findElement(By.css('.mark-late'));
    await lateButton.click();
    
    const status = await selenium.getText('.student-row:first-child .status');
    expect(status).toContain('Late');
  });

  test('should filter attendance by date', async () => {
    await selenium.type('input[name="date"]', '2024-03-12');
    await selenium.click('.filter-button');
    
    const dateDisplay = await selenium.getText('.date-display');
    expect(dateDisplay).toContain('2024-03-12');
  });

  test('should export attendance data', async () => {
    await selenium.click('.export-button');
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });
}); 