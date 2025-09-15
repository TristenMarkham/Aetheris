```javascript
const mongoose = require('mongoose');
const Report = require('../models/report');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class ReportController {
    // Get all reports
    async getAllReports(req, res) {
        try {
            const reports = await Report.find();
            res.json(reports);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Get a report by ID
    async getReportById(req, res) {
        try {
            const report = await Report.findById(req.params.id);
            if (!report) return res.status(404).json({ msg: 'Report not found' });
            res.json(report);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Report not found' });
            res.status(500).send('Server Error');
        }
    }

    // Create a new report
    async createReport(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { title, description, author } = req.body;

        try {
            const newReport = new Report({
                title,
                description,
                author
            });

            const report = await newReport.save();
            res.json(report);
        } catch (err) {
            logger.error(err.message);
            res.status(500).send('Server Error');
        }
    }

    // Update a report
    async updateReport(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { title, description, author } = req.body;

        const reportFields = {};
        if (title) reportFields.title = title;
        if (description) reportFields.description = description;
        if (author) reportFields.author = author;

        try {
            let report = await Report.findById(req.params.id);
            if (!report) return res.status(404).json({ msg: 'Report not found' });

            report = await Report.findByIdAndUpdate(req.params.id, { $set: reportFields }, { new: true });
            res.json(report);
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Report not found' });
            res.status(500).send('Server Error');
        }
    }

    // Delete a report
    async deleteReport(req, res) {
        try {
            let report = await Report.findById(req.params.id);
            if (!report) return res.status(404).json({ msg: 'Report not found' });

            await Report.findByIdAndRemove(req.params.id);
            res.json({ msg: 'Report removed' });
        } catch (err) {
            logger.error(err.message);
            if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Report not found' });
            res.status(500).send('Server Error');
        }
    }
}

module.exports = new ReportController();
```
This controller is for a "reports" module, where each report has a title, description, and author. It includes functions for getting all reports, getting a report by ID, creating a report, updating a report, and deleting a report. It uses Mongoose for database operations, express-validator for data validation and sanitization, and a custom logger for logging and audit trails. It uses async/await for asynchronous operations, and it handles errors with proper HTTP responses.