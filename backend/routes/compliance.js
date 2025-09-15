```javascript
const express = require('express');
const router = express.Router();

/**
 * @api {post} /compliance Create a new compliance
 * @apiName CreateCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiParam {String} name Compliance's name.
 * @apiParam {String} description Compliance's description.
 *
 * @apiSuccess {Object} compliance Compliance's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.post('/compliance', (req, res) => {
  // Create compliance logic here
});

/**
 * @api {get} /compliance Retrieve all compliances
 * @apiName RetrieveCompliances
 * @apiGroup Compliance
 * @apiPermission user
 *
 * @apiUse listParams
 *
 * @apiSuccess {Object[]} compliances List of compliances.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/compliance', (req, res) => {
  // Retrieve all compliances logic here
});

/**
 * @api {get} /compliance/:id Retrieve a compliance
 * @apiName RetrieveCompliance
 * @apiGroup Compliance
 * @apiPermission user
 *
 * @apiSuccess {Object} compliance Compliance's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Compliance not found.
 */
router.get('/compliance/:id', (req, res) => {
  // Retrieve a compliance logic here
});

/**
 * @api {put} /compliance/:id Update a compliance
 * @apiName UpdateCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiParam {String} name Compliance's name.
 * @apiParam {String} description Compliance's description.
 *
 * @apiSuccess {Object} compliance Compliance's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 * @apiError 404 Compliance not found.
 */
router.put('/compliance/:id', (req, res) => {
  // Update a compliance logic here
});

/**
 * @api {delete} /compliance/:id Delete a compliance
 * @apiName DeleteCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiSuccess (No Content 204) 204 No Content.
 * @apiError 401 Admin access only.
 * @apiError 404 Compliance not found.
 */
router.delete('/compliance/:id', (req, res) => {
  // Delete a compliance logic here
});

/**
 * @api {post} /compliance/bulk Create multiple compliances
 * @apiName CreateBulkCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiParam {Object[]} compliances Array of compliances.
 *
 * @apiSuccess {Object[]} compliances Array of created compliances.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.post('/compliance/bulk', (req, res) => {
  // Create multiple compliances logic here
});

/**
 * @api {get} /compliance/export Export compliances
 * @apiName ExportCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiSuccess {File} file CSV file of exported compliances.
 * @apiError 401 Admin access only.
 */
router.get('/compliance/export', (req, res) => {
  // Export compliances logic here
});

/**
 * @api {post} /compliance/import Import compliances
 * @apiName ImportCompliance
 * @apiGroup Compliance
 * @apiPermission admin
 *
 * @apiParam {File} file CSV file of compliances to import.
 *
 * @apiSuccess {Object[]} compliances Array of imported compliances.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.post('/compliance/import', (req, res) => {
  // Import compliances logic here
});

module.exports = router;
```