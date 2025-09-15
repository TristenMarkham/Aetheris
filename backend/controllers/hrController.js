```javascript
const mongoose = require('mongoose');
const HR = require('../models/hr');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// Get all HR records
exports.getAllHR = async (req, res, next) => {
    try {
        const hrRecords = await HR.find();
        res.status(200).json(hrRecords);
    } catch (error) {
        logger.error(`Failed to fetch HR records: ${error}`);
        res.status(500).json({ message: 'Failed to fetch HR records' });
    }
};

// Get a specific HR record
exports.getHR = async (req, res, next) => {
    const hrId = req.params.id;
    try {
        const hrRecord = await HR.findById(hrId);
        if (!hrRecord) {
            return res.status(404).json({ message: 'HR record not found' });
        }
        res.status(200).json(hrRecord);
    } catch (error) {
        logger.error(`Failed to fetch HR record: ${error}`);
        res.status(500).json({ message: 'Failed to fetch HR record' });
    }
};

// Create a new HR record
exports.createHR = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, position, salary } = req.body;
    const hrRecord = new HR({ name, position, salary });
    try {
        await hrRecord.save();
        res.status(201).json({ message: 'HR record created', hrRecord });
    } catch (error) {
        logger.error(`Failed to create HR record: ${error}`);
        res.status(500).json({ message: 'Failed to create HR record' });
    }
};

// Update an existing HR record
exports.updateHR = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const hrId = req.params.id;
    const { name, position, salary } = req.body;
    try {
        const hrRecord = await HR.findById(hrId);
        if (!hrRecord) {
            return res.status(404).json({ message: 'HR record not found' });
        }
        hrRecord.name = name;
        hrRecord.position = position;
        hrRecord.salary = salary;
        await hrRecord.save();
        res.status(200).json({ message: 'HR record updated', hrRecord });
    } catch (error) {
        logger.error(`Failed to update HR record: ${error}`);
        res.status(500).json({ message: 'Failed to update HR record' });
    }
};

// Delete an HR record
exports.deleteHR = async (req, res, next) => {
    const hrId = req.params.id;
    try {
        const hrRecord = await HR.findById(hrId);
        if (!hrRecord) {
            return res.status(404).json({ message: 'HR record not found' });
        }
        await HR.deleteOne({ _id: hrId });
        res.status(200).json({ message: 'HR record deleted' });
    } catch (error) {
        logger.error(`Failed to delete HR record: ${error}`);
        res.status(500).json({ message: 'Failed to delete HR record' });
    }
};
```