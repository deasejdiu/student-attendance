const User = require('../models/user.model');

// User registration
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists (handling uniqueness in code)
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check email uniqueness if provided
    if (req.body.email) {
      const existingEmail = await User.findOne({ where: { email: req.body.email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Create new user
    const newUser = await User.create({
      username,
      password,
      email: req.body.email || `${username}@example.com`, // Default email if not provided
      role: 'student' // Default role
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Additional user functionality can be added here 