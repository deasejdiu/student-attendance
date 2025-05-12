const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Class Management Tests', () => {
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
    await selenium.navigateTo('/classes');
  });

  test('should display class list', async () => {
    const classList = await selenium.waitForElementVisible('.class-list');
    expect(classList).toBeTruthy();
  });

  test('should add new class', async () => {
    await selenium.click('.add-class-button');
    
    await selenium.type('input[name="name"]', 'Mathematics 101');
    await selenium.type('input[name="code"]', 'MATH101');
    await selenium.type('input[name="description"]', 'Introduction to Mathematics');
    await selenium.type('input[name="capacity"]', '30');
    await selenium.type('input[name="schedule"]', 'Mon,Wed,Fri 10:00-11:30');
    await selenium.type('input[name="room"]', 'Room 101');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should edit class', async () => {
    const editButton = await selenium.waitForElementVisible('.edit-class-button:first-child');
    await editButton.click();
    
    await selenium.type('input[name="name"]', 'Advanced Mathematics');
    await selenium.type('input[name="description"]', 'Advanced Mathematics Course');
    await selenium.type('input[name="schedule"]', 'Tue,Thu 13:00-14:30');
    await selenium.type('input[name="room"]', 'Room 202');
    
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should delete class', async () => {
    const deleteButton = await selenium.waitForElementVisible('.delete-class-button:first-child');
    await deleteButton.click();
    
    await selenium.click('.confirm-delete-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should assign teacher to class', async () => {
    const assignButton = await selenium.waitForElementVisible('.assign-teacher-button:first-child');
    await assignButton.click();
    
    await selenium.click('.teacher-select option:nth-child(2)');
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should enroll students in class', async () => {
    const enrollButton = await selenium.waitForElementVisible('.enroll-students-button:first-child');
    await enrollButton.click();
    
    await selenium.click('.student-select option:nth-child(2)');
    await selenium.click('.save-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should view class details', async () => {
    const viewButton = await selenium.waitForElementVisible('.view-class-button:first-child');
    await viewButton.click();
    
    const classDetails = await selenium.waitForElementVisible('.class-details');
    expect(classDetails).toBeTruthy();
  });

  test('should search classes', async () => {
    await selenium.type('input[name="search"]', 'Mathematics');
    await selenium.click('.search-button');
    
    const searchResults = await selenium.waitForElementVisible('.class-list');
    expect(searchResults).toBeTruthy();
  });

  test('should filter classes by teacher', async () => {
    await selenium.click('.teacher-filter');
    await selenium.click('.teacher-filter option:nth-child(2)');
    
    const filteredList = await selenium.waitForElementVisible('.class-list');
    expect(filteredList).toBeTruthy();
  });

  test('should export class list', async () => {
    await selenium.click('.export-classes-button');
    
    const successMessage = await selenium.waitForElementVisible('.success-message');
    expect(successMessage).toBeTruthy();
  });

  test('should view class schedule', async () => {
    const scheduleButton = await selenium.waitForElementVisible('.view-schedule-button:first-child');
    await scheduleButton.click();
    
    const scheduleView = await selenium.waitForElementVisible('.schedule-view');
    expect(scheduleView).toBeTruthy();
  });
}); 