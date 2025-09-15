```javascript
const mongoose = require('mongoose');
const MobileApp = require('../models/mobile-app');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class MobileAppController {
    // Get all mobile apps
    async getAll(req, res) {
        try {
            const mobileApps = await MobileApp.find();
            res.status(200).json(mobileApps);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    // Get a mobile app by id
    async getById(req, res) {
        try {
            const mobileApp = await MobileApp.findById(req.params.id);
            if (!mobileApp) {
                return res.status(404).json({ message: 'Mobile App not found' });
            }
            res.status(200).json(mobileApp);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    // Create a new mobile app
    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const newMobileApp = new MobileApp(req.body);
            const mobileApp = await newMobileApp.save();
            res.status(201).json(mobileApp);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    // Update a mobile app
    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const mobileApp = await MobileApp.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!mobileApp) {
                return res.status(404).json({ message: 'Mobile App not found' });
            }
            res.status(200).json(mobileApp);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    // Delete a mobile app
    async delete(req, res) {
        try {
            const mobileApp = await MobileApp.findByIdAndRemove(req.params.id);
            if (!mobileApp) {
                return res.status(404).json({ message: 'Mobile App not found' });
            }
            res.status(200).json({ message: 'Mobile App deleted' });
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }
}

module.exports = new MobileAppController();
```
This code assumes that you have a logger utility and a MobileApp model defined. It also uses express-validator for request data validation. Please adjust the code as per your project structure and requirements.