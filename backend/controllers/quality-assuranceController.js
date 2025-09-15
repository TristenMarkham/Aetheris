```javascript
const mongoose = require('mongoose');
const QualityAssurance = require('../models/qualityAssurance');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class QualityAssuranceController {
    // Get all quality assurance records
    async getAll(req, res) {
        try {
            const qualityAssurances = await QualityAssurance.find();
            res.status(200).json(qualityAssurances);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Error occurred while fetching quality assurance records' });
        }
    }

    // Get a specific quality assurance record
    async getOne(req, res) {
        try {
            const qualityAssurance = await QualityAssurance.findById(req.params.id);
            if (!qualityAssurance) {
                return res.status(404).json({ message: 'Quality assurance record not found' });
            }
            res.status(200).json(qualityAssurance);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Error occurred while fetching quality assurance record' });
        }
    }

    // Create a new quality assurance record
    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { qualityMetric, qualityScore, comments } = req.body;

        try {
            const newQualityAssurance = new QualityAssurance({
                qualityMetric,
                qualityScore,
                comments
            });

            const savedQualityAssurance = await newQualityAssurance.save();
            res.status(201).json(savedQualityAssurance);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Error occurred while creating quality assurance record' });
        }
    }

    // Update a quality assurance record
    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { qualityMetric, qualityScore, comments } = req.body;

        try {
            const updatedQualityAssurance = await QualityAssurance.findByIdAndUpdate(req.params.id, {
                qualityMetric,
                qualityScore,
                comments
            }, { new: true });

            if (!updatedQualityAssurance) {
                return res.status(404).json({ message: 'Quality assurance record not found' });
            }

            res.status(200).json(updatedQualityAssurance);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Error occurred while updating quality assurance record' });
        }
    }

    // Delete a quality assurance record
    async delete(req, res) {
        try {
            const deletedQualityAssurance = await QualityAssurance.findByIdAndDelete(req.params.id);
            if (!deletedQualityAssurance) {
                return res.status(404).json({ message: 'Quality assurance record not found' });
            }
            res.status(200).json(deletedQualityAssurance);
        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ message: 'Error occurred while deleting quality assurance record' });
        }
    }
}

module.exports = new QualityAssuranceController();
```