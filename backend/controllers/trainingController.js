```javascript
const mongoose = require('mongoose');
const Training = require('../models/training');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class TrainingController {
    // Get all trainings
    async getAllTrainings(req, res) {
        try {
            const trainings = await Training.find();
            res.json(trainings);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Get a single training
    async getTraining(req, res) {
        try {
            const training = await Training.findById(req.params.id);

            if (!training) {
                return res.status(404).json({ msg: 'Training not found' });
            }

            res.json(training);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Training not found' });
            }
            res.status(500).send('Server Error');
        }
    }

    // Create a new training
    async createTraining(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, date } = req.body;

        try {
            let training = new Training({
                title,
                description,
                date,
            });

            training = await training.save();

            res.json(training);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Update a training
    async updateTraining(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, date } = req.body;

        const trainingFields = {};
        if (title) trainingFields.title = title;
        if (description) trainingFields.description = description;
        if (date) trainingFields.date = date;

        try {
            let training = await Training.findById(req.params.id);

            if (!training) {
                return res.status(404).json({ msg: 'Training not found' });
            }

            training = await Training.findByIdAndUpdate(
                req.params.id,
                { $set: trainingFields },
                { new: true }
            );

            res.json(training);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Training not found' });
            }
            res.status(500).send('Server Error');
        }
    }

    // Delete a training
    async deleteTraining(req, res) {
        try {
            let training = await Training.findById(req.params.id);

            if (!training) {
                return res.status(404).json({ msg: 'Training not found' });
            }

            await Training.findByIdAndRemove(req.params.id);

            res.json({ msg: 'Training removed' });
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Training not found' });
            }
            res.status(500).send('Server Error');
        }
    }
}

module.exports = new TrainingController();
```