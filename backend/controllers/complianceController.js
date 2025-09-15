```javascript
const mongoose = require('mongoose');
const Compliance = require('../models/compliance');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class ComplianceController {
    // Get all compliance records
    async getAll(req, res) {
        try {
            const complianceRecords = await Compliance.find();
            res.status(200).json(complianceRecords);
        } catch (error) {
            logger.error(`Failed to fetch compliance records: ${error}`);
            res.status(500).json({ error: 'Failed to fetch compliance records' });
        }
    }

    // Get a specific compliance record
    async getOne(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        try {
            const complianceRecord = await Compliance.findById(id);
            if (!complianceRecord) {
                return res.status(404).json({ error: 'Compliance record not found' });
            }
            res.status(200).json(complianceRecord);
        } catch (error) {
            logger.error(`Failed to fetch compliance record: ${error}`);
            res.status(500).json({ error: 'Failed to fetch compliance record' });
        }
    }

    // Create a new compliance record
    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const complianceRecord = new Compliance(req.body);
        try {
            const savedRecord = await complianceRecord.save();
            res.status(201).json(savedRecord);
        } catch (error) {
            logger.error(`Failed to create compliance record: ${error}`);
            res.status(500).json({ error: 'Failed to create compliance record' });
        }
    }

    // Update a compliance record
    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        try {
            const updatedRecord = await Compliance.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedRecord) {
                return res.status(404).json({ error: 'Compliance record not found' });
            }
            res.status(200).json(updatedRecord);
        } catch (error) {
            logger.error(`Failed to update compliance record: ${error}`);
            res.status(500).json({ error: 'Failed to update compliance record' });
        }
    }

    // Delete a compliance record
    async delete(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        try {
            const deletedRecord = await Compliance.findByIdAndRemove(id);
            if (!deletedRecord) {
                return res.status(404).json({ error: 'Compliance record not found' });
            }
            res.status(200).json({ message: 'Compliance record deleted successfully' });
        } catch (error) {
            logger.error(`Failed to delete compliance record: ${error}`);
            res.status(500).json({ error: 'Failed to delete compliance record' });
        }
    }
}

module.exports = new ComplianceController();
```

This controller assumes that there is a Compliance model defined in the models directory and a logger utility for logging errors. Also, it uses express-validator for request validation. You need to define validation rules in your routes.