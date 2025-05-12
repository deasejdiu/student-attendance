const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Student Management Tests', () => {
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
    await selenium.navigateTo('/students');
  });

  test('should display student list', async () => {
    const studentList = await selenium.waitForElementVisible('.student-list');
    expect(studentList).toBeTruthy();
  });

  test('should add new student', async () => {
    await selenium.click('.add-student-button');
    
    await selenium.type('input[name="firstName"]', 'John');
    await selenium.type('input[name="lastName"]', 'Doe');
    await selenium.type('input[name="email"]', 'john.doe@example.com');
    await selenium.type('input[name="studentId"]', '12345');
    await selenium.type('input[name="phone"]', '1234567890');
    await selenium.type('input[name="address"]', '123 Main St');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should edit student', async () => {
    const editButton = await selenium.waitForElementVisible('.edit-student-button:first-child');
    await editButton.click();
    
    await selenium.type('input[name="firstName"]', 'Jane');
    await selenium.type('input[name="lastName"]', 'Smith');
    await selenium.type('input[name="phone"]', '9876543210');
    await selenium.type('input[name="address"]', '456 Oak St');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should delete student', async () => {
    const deleteButton = await selenium.waitForElementVisible('.delete-student-button:first-child');
    await deleteButton.click();
    
    await selenium.click('.confirm-delete-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should search students', async () => {
    await selenium.type('input[name="search"]', 'John');
    await selenium.click('.search-button');
    
    const searchResults = await selenium.waitForElementVisible('.student-list');
    expect(searchResults).toBeTruthy();
  });

  test('should view student details', async () => {
    const viewButton = await selenium.waitForElementVisible('.view-student-button:first-child');
    await viewButton.click();
    
    const studentDetails = await selenium.waitForElementVisible('.student-details');
    expect(studentDetails).toBeTruthy();
  });

  test('should filter students by class', async () => {
    await selenium.click('.class-filter');
    await selenium.click('.class-filter option:nth-child(2)');
    
    const filteredList = await selenium.waitForElementVisible('.student-list');
    expect(filteredList).toBeTruthy();
  });

  test('should export student list', async () => {
    await selenium.click('.export-students-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should bulk import students', async () => {
    await selenium.click('.import-students-button');
    
    // Note: File upload would need to be handled differently in Selenium
    // This is a placeholder for the test
    const importForm = await selenium.waitForElementVisible('.import-form');
    expect(importForm).toBeTruthy();
  });
}); 