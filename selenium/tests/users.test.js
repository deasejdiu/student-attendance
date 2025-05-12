const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('User Management Tests', () => {
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
    await selenium.navigateTo('/users');
  });

  test('should display user list', async () => {
    const userList = await selenium.waitForElementVisible('.user-list');
    expect(userList).toBeTruthy();
  });

  test('should add new user', async () => {
    await selenium.click('.add-user-button');
    
    await selenium.type('input[name="username"]', 'newuser');
    await selenium.type('input[name="email"]', 'newuser@example.com');
    await selenium.type('input[name="password"]', 'password123');
    await selenium.click('select[name="role"] option[value="teacher"]');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should edit user', async () => {
    const editButton = await selenium.waitForElementVisible('.edit-user-button:first-child');
    await editButton.click();
    
    await selenium.type('input[name="email"]', 'updated@example.com');
    await selenium.type('input[name="password"]', 'newpassword123');
    await selenium.click('select[name="role"] option[value="admin"]');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should delete user', async () => {
    const deleteButton = await selenium.waitForElementVisible('.delete-user-button:first-child');
    await deleteButton.click();
    
    await selenium.click('.confirm-delete-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should search users', async () => {
    await selenium.type('input[name="search"]', 'admin');
    await selenium.click('.search-button');
    
    const searchResults = await selenium.waitForElementVisible('.user-list');
    expect(searchResults).toBeTruthy();
  });

  test('should filter users by role', async () => {
    await selenium.click('.role-filter');
    await selenium.click('.role-filter option[value="teacher"]');
    
    const filteredList = await selenium.waitForElementVisible('.user-list');
    expect(filteredList).toBeTruthy();
  });

  test('should view user details', async () => {
    const viewButton = await selenium.waitForElementVisible('.view-user-button:first-child');
    await viewButton.click();
    
    const userDetails = await selenium.waitForElementVisible('.user-details');
    expect(userDetails).toBeTruthy();
  });

  test('should change user status', async () => {
    const statusButton = await selenium.waitForElementVisible('.change-status-button:first-child');
    await statusButton.click();
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should reset user password', async () => {
    const resetButton = await selenium.waitForElementVisible('.reset-password-button:first-child');
    await resetButton.click();
    
    await selenium.type('input[name="newPassword"]', 'resetpassword123');
    await selenium.type('input[name="confirmPassword"]', 'resetpassword123');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });
}); 