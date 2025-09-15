```javascript
const mongoose = require('mongoose');
const FieldOperations = require('../models/FieldOperations');
const logger = require('../utils/logger');

// Data validation library
const Joi = require('joi');

// Define the validation schema
const fieldOperationsSchema = Joi.object({
  operationName: Joi.string().required(),
  operationType: Joi.string().required(),
  operationDetails: Joi.string().required(),
  operationDate: Joi.date().required()
});

module.exports = {
  // Get all field operations
  getAll: async (req, res) => {
    try {
      const operations = await FieldOperations.find();
      res.status(200).json(operations);
    } catch (error) {
      logger.error(`Failed to fetch field operations: ${error}`);
      res.status(500).json({ error: 'Failed to fetch field operations' });
    }
  },

  // Get a single field operation
  getOne: async (req, res) => {
    try {
      const operation = await FieldOperations.findById(req.params.id);
      if (!operation) return res.status(404).json({ error: 'Operation not found' });
      res.status(200).json(operation);
    } catch (error) {
      logger.error(`Failed to fetch field operation: ${error}`);
      res.status(500).json({ error: 'Failed to fetch field operation' });
    }
  },

  // Create a new field operation
  create: async (req, res) => {
    // Validate the request body
    const { error } = fieldOperationsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const operation = new FieldOperations(req.body);
    try {
      const savedOperation = await operation.save();
      res.status(201).json(savedOperation);
    } catch (error) {
      logger.error(`Failed to create field operation: ${error}`);
      res.status(500).json({ error: 'Failed to create field operation' });
    }
  },

  // Update a field operation
  update: async (req, res) => {
    // Validate the request body
    const { error } = fieldOperationsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const updatedOperation = await FieldOperations.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedOperation) return res.status(404).json({ error: 'Operation not found' });
      res.status(200).json(updatedOperation);
    } catch (error) {
      logger.error(`Failed to update field operation: ${error}`);
      res.status(500).json({ error: 'Failed to update field operation' });
    }
  },

  // Delete a field operation
  delete: async (req, res) => {
    try {
      const operation = await FieldOperations.findByIdAndRemove(req.params.id);
      if (!operation) return res.status(404).json({ error: 'Operation not found' });
      res.status(200).json({ message: 'Operation deleted successfully' });
    } catch (error) {
      logger.error(`Failed to delete field operation: ${error}`);
      res.status(500).json({ error: 'Failed to delete field operation' });
    }
  }
};
```