Here is a basic example of how you might structure your Express.js routes for a document management module. This is a simplified example and doesn't cover every aspect you mentioned, but it should give you a good starting point.

```javascript
const express = require('express');
const router = express.Router();

/**
 * @api {get} /document-management/documents Request all documents
 * @apiName GetDocuments
 * @apiGroup DocumentManagement
 *
 * @apiParam {Number} page Number of the page for pagination.
 * @apiParam {Number} limit Limit number of documents to return per page.
 * @apiParam {String} sortBy Property to sort documents by.
 * @apiParam {String} filter Filter documents by this property.
 *
 * @apiSuccess {Object[]} documents List of documents.
 */
router.get('/documents', (req, res) => {
    // Implement your logic here
});

/**
 * @api {post} /document-management/documents Create a new document
 * @apiName CreateDocument
 * @apiGroup DocumentManagement
 *
 * @apiParam {String} title Document's title.
 * @apiParam {String} content Document's content.
 *
 * @apiSuccess {Object} document The created document.
 */
router.post('/documents', (req, res) => {
    // Implement your logic here
});

/**
 * @api {get} /document-management/documents/:id Request a specific document
 * @apiName GetDocument
 * @apiGroup DocumentManagement
 *
 * @apiParam {Number} id Document's unique ID.
 *
 * @apiSuccess {Object} document The requested document.
 */
router.get('/documents/:id', (req, res) => {
    // Implement your logic here
});

/**
 * @api {put} /document-management/documents/:id Update a specific document
 * @apiName UpdateDocument
 * @apiGroup DocumentManagement
 *
 * @apiParam {Number} id Document's unique ID.
 * @apiParam {String} title Document's new title.
 * @apiParam {String} content Document's new content.
 *
 * @apiSuccess {Object} document The updated document.
 */
router.put('/documents/:id', (req, res) => {
    // Implement your logic here
});

/**
 * @api {delete} /document-management/documents/:id Delete a specific document
 * @apiName DeleteDocument
 * @apiGroup DocumentManagement
 *
 * @apiParam {Number} id Document's unique ID.
 *
 * @apiSuccess {Object} document The deleted document.
 */
router.delete('/documents/:id', (req, res) => {
    // Implement your logic here
});

module.exports = router;
```

This code creates a new Express router and defines routes for getting all documents, creating a new document, getting a specific document by ID, updating a document by ID, and deleting a document by ID. Each route has a corresponding API documentation comment above it that describes what the route does, what parameters it accepts, and what it returns.