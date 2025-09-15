```javascript
const express = require('express');
const router = express.Router();
const fieldOperationsController = require('../controllers/fieldOperationsController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

/**
 * @route   POST api/field-operations
 * @desc    Create a new field operation
 * @access  Private
 */
router.post('/', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('type', 'Type is required').not().isEmpty(),
    ],
    fieldOperationsController.createFieldOperation
]);

/**
 * @route   GET api/field-operations
 * @desc    Get all field operations
 * @access  Private
 */
router.get('/', auth, fieldOperationsController.getAllFieldOperations);

/**
 * @route   GET api/field-operations/:id
 * @desc    Get a specific field operation by ID
 * @access  Private
 */
router.get('/:id', auth, fieldOperationsController.getFieldOperation);

/**
 * @route   PUT api/field-operations/:id
 * @desc    Update a specific field operation by ID
 * @access  Private
 */
router.put('/:id', auth, fieldOperationsController.updateFieldOperation);

/**
 * @route   DELETE api/field-operations/:id
 * @desc    Delete a specific field operation by ID
 * @access  Private
 */
router.delete('/:id', auth, fieldOperationsController.deleteFieldOperation);

/**
 * @route   POST api/field-operations/bulk
 * @desc    Perform bulk operations
 * @access  Private
 */
router.post('/bulk', auth, fieldOperationsController.bulkOperations);

/**
 * @route   GET api/field-operations/export
 * @desc    Export field operations
 * @access  Private
 */
router.get('/export', auth, fieldOperationsController.exportFieldOperations);

/**
 * @route   POST api/field-operations/import
 * @desc    Import field operations
 * @access  Private
 */
router.post('/import', auth, fieldOperationsController.importFieldOperations);

/**
 * @route   GET api/field-operations/industry/:industryId
 * @desc    Get field operations for a specific industry
 * @access  Private
 */
router.get('/industry/:industryId', auth, fieldOperationsController.getFieldOperationsByIndustry);

module.exports = router;
```

This code assumes that you have a controller file named `fieldOperationsController.js` in your controllers directory with the corresponding methods for each route. Also, an `auth` middleware is used to protect the routes.