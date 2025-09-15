```javascript
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const QualityAssurance = require('../models/QualityAssurance');

/**
 * @route   POST api/quality-assurance
 * @desc    Create a new quality assurance record
 * @access  Private
 */
router.post('/', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;

  try {
    let qa = new QualityAssurance({
      title,
      description,
      user: req.user.id
    });

    qa = await qa.save();

    res.json(qa);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/quality-assurance
 * @desc    Get all quality assurance records
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const qa = await QualityAssurance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(qa);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/quality-assurance/:id
 * @desc    Get quality assurance record by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const qa = await QualityAssurance.findById(req.params.id);

    if (!qa) {
      return res.status(404).json({ msg: 'Quality assurance record not found' });
    }

    res.json(qa);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quality assurance record not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT api/quality-assurance/:id
 * @desc    Update quality assurance record
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  const { title, description } = req.body;

  const qaFields = {};
  if (title) qaFields.title = title;
  if (description) qaFields.description = description;

  try {
    let qa = await QualityAssurance.findById(req.params.id);

    if (!qa) {
      return res.status(404).json({ msg: 'Quality assurance record not found' });
    }

    qa = await QualityAssurance.findByIdAndUpdate(
      req.params.id,
      { $set: qaFields },
      { new: true }
    );

    res.json(qa);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE api/quality-assurance/:id
 * @desc    Delete quality assurance record
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    let qa = await QualityAssurance.findById(req.params.id);

    if (!qa) {
      return res.status(404).json({ msg: 'Quality assurance record not found' });
    }

    await QualityAssurance.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Quality assurance record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
```
This code does not include bulk operations, export/import functionality, and advanced querying. These features would require additional routes and logic, and may also require additional libraries or tools depending on the specific requirements.