const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Return the first error message for simplicity, or join all messages
        const errorMessage = error.errors.map((e) => e.message).join(', ') || 'Validation error';
        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        });
      }
      next(error);
    }
  };
};

module.exports = { validate };
