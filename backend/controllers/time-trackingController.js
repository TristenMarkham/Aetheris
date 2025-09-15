```javascript
const mongoose = require('mongoose');
const TimeTracking = require('../models/timeTracking');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class TimeTrackingController {
    constructor() {
        this.timeTracking = mongoose.model('TimeTracking');
    }

    async createTimeEntry(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            let timeEntry = new this.timeTracking(req.body);
            timeEntry = await timeEntry.save();

            logger.info(`Time entry created with id: ${timeEntry._id}`);

            res.status(201).json(timeEntry);
        } catch (err) {
            logger.error(`Error creating time entry: ${err.message}`);
            next(err);
        }
    }

    async getTimeEntries(req, res, next) {
        try {
            const timeEntries = await this.timeTracking.find();

            res.status(200).json(timeEntries);
        } catch (err) {
            logger.error(`Error fetching time entries: ${err.message}`);
            next(err);
        }
    }

    async getTimeEntry(req, res, next) {
        try {
            const timeEntry = await this.timeTracking.findById(req.params.id);

            if (!timeEntry) {
                return res.status(404).json({ message: 'Time entry not found' });
            }

            res.status(200).json(timeEntry);
        } catch (err) {
            logger.error(`Error fetching time entry: ${err.message}`);
            next(err);
        }
    }

    async updateTimeEntry(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            let timeEntry = await this.timeTracking.findById(req.params.id);

            if (!timeEntry) {
                return res.status(404).json({ message: 'Time entry not found' });
            }

            timeEntry = await this.timeTracking.findByIdAndUpdate(req.params.id, req.body, { new: true });

            logger.info(`Time entry updated with id: ${timeEntry._id}`);

            res.status(200).json(timeEntry);
        } catch (err) {
            logger.error(`Error updating time entry: ${err.message}`);
            next(err);
        }
    }

    async deleteTimeEntry(req, res, next) {
        try {
            let timeEntry = await this.timeTracking.findById(req.params.id);

            if (!timeEntry) {
                return res.status(404).json({ message: 'Time entry not found' });
            }

            await this.timeTracking.findByIdAndRemove(req.params.id);

            logger.info(`Time entry deleted with id: ${timeEntry._id}`);

            res.status(200).json({ message: 'Time entry deleted successfully' });
        } catch (err) {
            logger.error(`Error deleting time entry: ${err.message}`);
            next(err);
        }
    }
}

module.exports = new TimeTrackingController();
```