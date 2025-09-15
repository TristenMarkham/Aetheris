Here is a basic example of how you might structure the REST API routes for the "hr" module of a universal business management platform using Express.js:

```javascript
const express = require('express');
const router = express.Router();

/**
 * @api {post} /hr Create new HR record
 * @apiName CreateHR
 * @apiGroup HR
 * 
 * @apiParam {String} name Name of the HR record.
 * 
 * @apiSuccess {Object} HR Newly created HR record.
 * 
 * @apiError {String} error The error message.
 */
router.post('/', (req, res) => {
    // Implement create operation here
});

/**
 * @api {get} /hr/:id Request HR record
 * @apiName GetHR
 * @apiGroup HR
 * 
 * @apiParam {Number} id HR record unique ID.
 * 
 * @apiSuccess {Object} HR HR record.
 * 
 * @apiError {String} error The error message.
 */
router.get('/:id', (req, res) => {
    // Implement read operation here
});

/**
 * @api {put} /hr/:id Update HR record
 * @apiName UpdateHR
 * @apiGroup HR
 * 
 * @apiParam {Number} id HR record unique ID.
 * 
 * @apiSuccess {Object} HR Updated HR record.
 * 
 * @apiError {String} error The error message.
 */
router.put('/:id', (req, res) => {
    // Implement update operation here
});

/**
 * @api {delete} /hr/:id Delete HR record
 * @apiName DeleteHR
 * @apiGroup HR
 * 
 * @apiParam {Number} id HR record unique ID.
 * 
 * @apiSuccess {String} message Success message.
 * 
 * @apiError {String} error The error message.
 */
router.delete('/:id', (req, res) => {
    // Implement delete operation here
});

/**
 * @api {get} /hr Query HR records
 * @apiName QueryHR
 * @apiGroup HR
 * 
 * @apiParam {Object} query Query parameters for filtering, sorting and pagination.
 * 
 * @apiSuccess {Array} HRs List of HR records.
 * 
 * @apiError {String} error The error message.
 */
router.get('/', (req, res) => {
    // Implement advanced querying here
});

/**
 * @api {post} /hr/bulk Bulk operations on HR records
 * @apiName BulkHR
 * @apiGroup HR
 * 
 * @apiParam {Array} operations List of operations to perform.
 * 
 * @apiSuccess {Array} results List of results of the operations.
 * 
 * @apiError {String} error The error message.
 */
router.post('/bulk', (req, res) => {
    // Implement bulk operations here
});

/**
 * @api {post} /hr/import Import HR records
 * @apiName ImportHR
 * @apiGroup HR
 * 
 * @apiParam {File} file File containing HR records to import.
 * 
 * @apiSuccess {String} message Success message.
 * 
 * @apiError {String} error The error message.
 */
router.post('/import', (req, res) => {
    // Implement import functionality here
});

/**
 * @api {get} /hr/export Export HR records
 * @apiName ExportHR
 * @apiGroup HR
 * 
 * @apiSuccess {File} file File containing exported HR records.
 * 
 * @apiError {String} error The error message.
 */
router.get('/export', (req, res) => {
    // Implement export functionality here
});

module.exports = router;
```

Please note that this is a basic structure. You will need to implement the actual functionality for each route. Also, you should add input validation, authorization checks, and error handling as needed.