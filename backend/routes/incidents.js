```javascript
const express = require('express');
const router = express.Router();

/**
 * @api {get} /api/incidents List all incidents
 * @apiName GetIncidents
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {Number} page Pagination page
 * @apiParam {Number} limit Pagination limit
 * @apiParam {String} sort Sorting field and direction (e.g. "createdAt_DESC")
 * @apiParam {Object} filter Filtering conditions (e.g. {"status":"open"})
 * 
 * @apiSuccess (200) {Object[]} incidents List of incidents
 * @apiError (400) {String} message Validation or error message.
 */
router.get('/', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.list);

/**
 * @api {post} /api/incidents Create new incident
 * @apiName CreateIncident
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {String} title Incident title
 * @apiParam {String} description Incident description
 * @apiParam {String} status Incident status
 * 
 * @apiSuccess (201) {Object} incident Created incident object
 * @apiError (400) {String} message Validation or error message.
 */
router.post('/', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.create);

/**
 * @api {get} /api/incidents/:id Get incident by ID
 * @apiName GetIncident
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {String} id Incident ID
 * 
 * @apiSuccess (200) {Object} incident Incident object
 * @apiError (400) {String} message Validation or error message.
 */
router.get('/:id', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.read);

/**
 * @api {put} /api/incidents/:id Update incident by ID
 * @apiName UpdateIncident
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {String} id Incident ID
 * @apiParam {String} title Incident title
 * @apiParam {String} description Incident description
 * @apiParam {String} status Incident status
 * 
 * @apiSuccess (200) {Object} incident Updated incident object
 * @apiError (400) {String} message Validation or error message.
 */
router.put('/:id', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.update);

/**
 * @api {delete} /api/incidents/:id Delete incident by ID
 * @apiName DeleteIncident
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {String} id Incident ID
 * 
 * @apiSuccess (204) {null} null No content
 * @apiError (400) {String} message Validation or error message.
 */
router.delete('/:id', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.delete);

/**
 * @api {post} /api/incidents/bulk Bulk operations (create, update, delete)
 * @apiName BulkIncidents
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {Object[]} operations List of operations to perform
 * 
 * @apiSuccess (200) {Object[]} results Results of operations
 * @apiError (400) {String} message Validation or error message.
 */
router.post('/bulk', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.bulk);

/**
 * @api {get} /api/incidents/export Export incidents to CSV
 * @apiName ExportIncidents
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiSuccess (200) {File} file CSV file
 * @apiError (400) {String} message Validation or error message.
 */
router.get('/export', /* AuthMiddleware, */ IncidentController.export);

/**
 * @api {post} /api/incidents/import Import incidents from CSV
 * @apiName ImportIncidents
 * @apiGroup Incidents
 * @apiPermission authenticated
 * 
 * @apiParam {File} file CSV file
 * 
 * @apiSuccess (200) {Object[]} incidents Imported incidents
 * @apiError (400) {String} message Validation or error message.
 */
router.post('/import', /* AuthMiddleware, ValidationMiddleware, */ IncidentController.import);

module.exports = router;
```

Please note that the actual implementation of the `IncidentController` and the middlewares (`AuthMiddleware`, `ValidationMiddleware`) are not included in this example. You would need to implement these according to your application's specific needs.