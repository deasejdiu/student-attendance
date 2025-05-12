const SeleniumHelper = require('../helpers/seleniumHelper');
const config = require('../config');

describe('Login Tests', () => {
  let selenium;

  beforeAll(async () => {
    selenium = new SeleniumHelper();
    await selenium.init();
  });

  afterAll(async () => {
    await selenium.quit();
  });

  beforeEach(async () => {
    await selenium.navigateTo('/login');
  });

  test('should login successfully with admin credentials', async () => {
    await selenium.login(
      config.adminCredentials.username,
      config.adminCredentials.password
    );
    const dashboardTitle = await selenium.getText('.dashboard-title');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('should login successfully with teacher credentials', async () => {
    await selenium.login(
      config.teacherCredentials.username,
      config.teacherCredentials.password
    );
    const dashboardTitle = await selenium.getText('.dashboard-title');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('should show error with invalid credentials', async () => {
    await selenium.type('input[name="username"]', 'invalid');
    await selenium.type('input[name="password"]', 'invalid');
    await selenium.click('button[type="submit"]');
    
    const errorMessage = await selenium.getText('.error-message');
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should logout successfully', async () => {
    await selenium.login(
      config.adminCredentials.username,
      config.adminCredentials.password
    );
    await selenium.logout();
    
    const loginTitle = await selenium.getText('.login-title');
    expect(loginTitle).toContain('Login');
  });
}); 