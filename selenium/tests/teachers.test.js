const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Teacher Management Tests', () => {
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
    await selenium.navigateTo('/teachers');
  });

  test('should display teacher list', async () => {
    const teacherList = await selenium.waitForElementVisible('.teacher-list');
    expect(teacherList).toBeTruthy();
  });

  test('should add new teacher', async () => {
    await selenium.click('.add-teacher-button');
    
    await selenium.type('input[name="firstName"]', 'Sarah');
    await selenium.type('input[name="lastName"]', 'Johnson');
    await selenium.type('input[name="email"]', 'sarah.johnson@example.com');
    await selenium.type('input[name="phone"]', '1234567890');
    await selenium.type('input[name="password"]', 'password123');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should edit teacher', async () => {
    const editButton = await selenium.waitForElementVisible('.edit-teacher-button:first-child');
    await editButton.click();
    
    await selenium.type('input[name="firstName"]', 'Michael');
    await selenium.type('input[name="lastName"]', 'Brown');
    await selenium.type('input[name="phone"]', '9876543210');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should delete teacher', async () => {
    const deleteButton = await selenium.waitForElementVisible('.delete-teacher-button:first-child');
    await deleteButton.click();
    
    await selenium.click('.confirm-delete-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should assign classes to teacher', async () => {
    const assignButton = await selenium.waitForElementVisible('.assign-classes-button:first-child');
    await assignButton.click();
    
    await selenium.click('.class-select option:nth-child(2)');
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should view teacher details', async () => {
    const viewButton = await selenium.waitForElementVisible('.view-teacher-button:first-child');
    await viewButton.click();
    
    const teacherDetails = await selenium.waitForElementVisible('.teacher-details');
    expect(teacherDetails).toBeTruthy();
  });

  test('should search teachers', async () => {
    await selenium.type('input[name="search"]', 'Sarah');
    await selenium.click('.search-button');
    
    const searchResults = await selenium.waitForElementVisible('.teacher-list');
    expect(searchResults).toBeTruthy();
  });
}); 