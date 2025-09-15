```javascript
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

class ScheduleController {
    // Get all schedules
    static async getAll(req, res) {
        try {
            const schedules = await Schedule.find();
            res.json(schedules);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Get schedule by ID
    static async getById(req, res) {
        try {
            const schedule = await Schedule.findById(req.params.id);

            if (!schedule) {
                return res.status(404).json({ msg: 'Schedule not found' });
            }

            res.json(schedule);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Schedule not found' });
            }
            res.status(500).send('Server Error');
        }
    }

    // Create new schedule
    static async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, date, time, description } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const newSchedule = new Schedule({
                user: userId,
                date,
                time,
                description
            });

            const schedule = await newSchedule.save();

            res.json(schedule);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Update schedule
    static async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, date, time, description } = req.body;

        const scheduleFields = {};
        if (userId) scheduleFields.user = userId;
        if (date) scheduleFields.date = date;
        if (time) scheduleFields.time = time;
        if (description) scheduleFields.description = description;

        try {
            let schedule = await Schedule.findById(req.params.id);

            if (!schedule) {
                return res.status(404).json({ msg: 'Schedule not found' });
            }

            schedule = await Schedule.findByIdAndUpdate(
                req.params.id,
                { $set: scheduleFields },
                { new: true }
            );

            res.json(schedule);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Schedule not found' });
            }
            res.status(500).send('Server Error');
        }
    }

    // Delete schedule
    static async delete(req, res) {
        try {
            let schedule = await Schedule.findById(req.params.id);

            if (!schedule) {
                return res.status(404).json({ msg: 'Schedule not found' });
            }

            await Schedule.findByIdAndRemove(req.params.id);

            res.json({ msg: 'Schedule removed' });
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Schedule not found' });
            }
            res.status(500).send('Server Error');
        }
    }
}

module.exports = ScheduleController;
```
This is a basic implementation of a scheduling module using Express.js and Mongoose. It includes CRUD operations, error handling, data validation, and logging. Note that this is a simplified version and does not include all possible edge cases and additional features that might be required in a production environment.