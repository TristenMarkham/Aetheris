```javascript
const mongoose = require('mongoose');
const Document = require('../models/document');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class DocumentController {
    // Get all documents
    async getAllDocuments(req, res, next) {
        try {
            const documents = await Document.find();
            res.status(200).json(documents);
            logger.info(`Fetched all documents`);
        } catch (error) {
            logger.error(`Failed to fetch documents: ${error}`);
            res.status(500).json({ error: 'Failed to fetch documents' });
        }
    }

    // Get a single document
    async getDocument(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const documentId = req.params.id;
        try {
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }
            res.status(200).json(document);
            logger.info(`Fetched document with id: ${documentId}`);
        } catch (error) {
            logger.error(`Failed to fetch document: ${error}`);
            res.status(500).json({ error: 'Failed to fetch document' });
        }
    }

    // Create a new document
    async createDocument(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        const document = new Document({
            _id: new mongoose.Types.ObjectId(),
            title,
            content
        });

        try {
            await document.save();
            res.status(201).json({
                message: 'Document created successfully',
                document
            });
            logger.info(`Created document with id: ${document._id}`);
        } catch (error) {
            logger.error(`Failed to create document: ${error}`);
            res.status(500).json({ error: 'Failed to create document' });
        }
    }

    // Update a document
    async updateDocument(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const documentId = req.params.id;
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }

        try {
            await Document.update({ _id: documentId }, { $set: updateOps });
            res.status(200).json({
                message: 'Document updated',
                request: {
                    type: 'GET',
                    url: `http://${req.headers.host}/documents/${documentId}`
                }
            });
            logger.info(`Updated document with id: ${documentId}`);
        } catch (error) {
            logger.error(`Failed to update document: ${error}`);
            res.status(500).json({ error: 'Failed to update document' });
        }
    }

    // Delete a document
    async deleteDocument(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const documentId = req.params.id;
        try {
            await Document.remove({ _id: documentId });
            res.status(200).json({
                message: 'Document deleted',
                request: {
                    type: 'POST',
                    url: `http://${req.headers.host}/documents`,
                    body: { title: 'String', content: 'String' }
                }
            });
            logger.info(`Deleted document with id: ${documentId}`);
        } catch (error) {
            logger.error(`Failed to delete document: ${error}`);
            res.status(500).json({ error: 'Failed to delete document' });
        }
    }
}

module.exports = new DocumentController();
```