```javascript
const mongoose = require('mongoose');
const Incident = require('../models/incident');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class IncidentController {
    // Get all incidents
    async getAllIncidents(req, res) {
        try {
            const incidents = await Incident.find();
            res.status(200).json(incidents);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Get a single incident
    async getIncident(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const incident = await Incident.findById(req.params.id);
            if (!incident) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            res.status(200).json(incident);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Create a new incident
    async createIncident(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, status } = req.body;

        try {
            const newIncident = new Incident({
                title,
                description,
                status,
            });

            const incident = await newIncident.save();
            res.status(201).json(incident);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Update an incident
    async updateIncident(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, status } = req.body;

        try {
            let incident = await Incident.findById(req.params.id);
            if (!incident) {
                return res.status(404).json({ error: 'Incident not found' });
            }

            incident = await Incident.findByIdAndUpdate(
                req.params.id,
                { $set: { title, description, status } },
                { new: true }
            );

            res.status(200).json(incident);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Delete an incident
    async deleteIncident(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let incident = await Incident.findById(req.params.id);
            if (!incident) {
                return res.status(404).json({ error: 'Incident not found' });
            }

            await Incident.findByIdAndRemove(req.params.id);
            res.status(200).json({ msg: 'Incident deleted' });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new IncidentController();
```