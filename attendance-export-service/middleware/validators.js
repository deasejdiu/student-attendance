const Joi = require('joi');
const { createLogger } = require('../utils/logger');

const logger = createLogger('validators');

// Validate export job request
const validateExportRequest = (req, res, next) => {
  const schema = Joi.object({
    studentId: Joi.string().required(),
    format: Joi.string().valid('csv', 'excel', 'pdf', 'json').required(),
    startDate: Joi.date().iso().allow(null, ''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null, '')
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    logger.warn('Export request validation failed:', error.details);
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateExportRequest
};