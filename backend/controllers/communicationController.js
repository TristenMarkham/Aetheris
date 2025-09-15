```javascript
const mongoose = require('mongoose');
const Communication = require('../models/communication');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class CommunicationController {
    // Get all communications
    async getAll(req, res) {
        try {
            const communications = await Communication.find();
            res.status(200).json(communications);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ error: 'An error occurred while fetching communications' });
        }
    }

    // Get a specific communication
    async getOne(req, res) {
        try {
            const id = req.params.id;
            const communication = await Communication.findById(id);
            if (!communication) {
                return res.status(404).json({ error: 'Communication not found' });
            }
            res.status(200).json(communication);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ error: 'An error occurred while fetching the communication' });
        }
    }

    // Create a new communication
    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        const newCommunication = new Communication({
            title,
            content
        });

        try {
            const savedCommunication = await newCommunication.save();
            res.status(201).json(savedCommunication);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ error: 'An error occurred while creating the communication' });
        }
    }

    // Update a communication
    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        const updatedCommunication = { title, content };

        try {
            const communication = await Communication.findByIdAndUpdate(req.params.id, updatedCommunication, { new: true });
            if (!communication) {
                return res.status(404).json({ error: 'Communication not found' });
            }
            res.status(200).json(communication);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ error: 'An error occurred while updating the communication' });
        }
    }

    // Delete a communication
    async delete(req, res) {
        try {
            const communication = await Communication.findByIdAndRemove(req.params.id);
            if (!communication) {
                return res.status(404).json({ error: 'Communication not found' });
            }
            res.status(200).json({ message: 'Communication deleted successfully' });
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ error: 'An error occurred while deleting the communication' });
        }
    }
}

module.exports = new CommunicationController();
```