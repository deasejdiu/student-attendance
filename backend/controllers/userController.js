const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

const userController = {
  // Register a new user
  async register(req, res) {
    try {
      const { username, password, email, role } = req.body;
      
      // Check if user with same username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this username or email already exists' 
        });
      }

      const user = await User.create({
        username,
        password,
        email,
        role: role || 'teacher'
      });

      // Don't send password in response
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      res.status(201).json(userResponse);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Find user by username
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: user.role 
        }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      // Check if the requesting user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      // Check if the requesting user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user (admin only, or self)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, role, password } = req.body;
      
      // Check if the requesting user is an admin or updating their own profile
      if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
      }
      
      // Find the user
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if username or email is being changed and if they're already in use
      if ((username && username !== user.username) || (email && email !== user.email)) {
        const existingUser = await User.findOne({
          where: {
            [Sequelize.Op.and]: [
              { id: { [Sequelize.Op.ne]: id } }, // Not the current user
              { 
                [Sequelize.Op.or]: [
                  username ? { username } : null,
                  email ? { email } : null
                ].filter(Boolean) // Filter out null conditions
              }
            ]
          }
        });
        
        if (existingUser) {
          return res.status(400).json({ 
            message: 'Username or email already in use by another user' 
          });
        }
      }
      
      // Only admin can change roles
      if (role && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can change user roles' });
      }
      
      // Update the user
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role && req.user.role === 'admin') updateData.role = role;
      if (password) updateData.password = password; // Password will be hashed by the model hook
      
      await user.update(updateData);
      
      // Return the updated user without password
      const updatedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if the requesting user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // Prevent admin from deleting themselves
      if (req.user.id === id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      await user.destroy();
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Search users
  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        // If no search query, return all users
        const users = await User.findAll({
          attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });
        return res.json(users);
      }
      
      // Perform search
      const users = await User.findAll({
        where: {
          [Sequelize.Op.or]: [
            { username: { [Sequelize.Op.iLike]: `%${query}%` } },
            { email: { [Sequelize.Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'username', 'email', 'role', 'createdAt']
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController; 