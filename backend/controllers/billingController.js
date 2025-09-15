```javascript
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const Billing = require('../models/Billing');
const { ErrorHandler } = require('../utils/error');

// Business logic functions
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Database operations
const getBillings = async (req, res, next) => {
  try {
    const billings = await Billing.find();
    res.status(200).json(billings);
  } catch (err) {
    next(err);
  }
};

const getBillingById = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);
    if (!billing) {
      throw new ErrorHandler(404, 'Billing not found');
    }
    res.status(200).json(billing);
  } catch (err) {
    next(err);
  }
};

const createBilling = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ErrorHandler(400, 'Invalid input', errors.array());
    }
    const total = calculateTotal(req.body.items);
    const billing = new Billing({ ...req.body, total });
    const savedBilling = await billing.save();
    res.status(201).json(savedBilling);
  } catch (err) {
    next(err);
  }
};

const updateBilling = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ErrorHandler(400, 'Invalid input', errors.array());
    }
    const total = calculateTotal(req.body.items);
    const updatedBilling = await Billing.findByIdAndUpdate(
      req.params.id,
      { ...req.body, total },
      { new: true }
    );
    if (!updatedBilling) {
      throw new ErrorHandler(404, 'Billing not found');
    }
    res.status(200).json(updatedBilling);
  } catch (err) {
    next(err);
  }
};

const deleteBilling = async (req, res, next) => {
  try {
    const deletedBilling = await Billing.findByIdAndDelete(req.params.id);
    if (!deletedBilling) {
      throw new ErrorHandler(404, 'Billing not found');
    }
    res.status(200).json(deletedBilling);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBillings,
  getBillingById,
  createBilling,
  updateBilling,
  deleteBilling,
};
```