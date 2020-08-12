import extend from 'lodash/extend';
import Expense from '../models/expense.model';
import errorHandler from '../helpers/dbErrorHandler';

const create = async (req, res) => {
  try {
    req.body.recorded_by = req.auth._id;
    const expense = new Expense(req.body);
    await expense.save();
    return res.status(200).json({
      message: 'Expense recorded!',
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const expenseByID = async (req, res, next, id) => {
  try {
    const expense = await Expense.findById(id)
      .populate('recorded_by', '_id name')
      .exec();
    if (!expense) {
      return res.status('400').json({
        error: 'Expense record not found',
      });
    }
    req.expense = expense;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByUser = async (req, res) => {
  const { firstDay } = req.query;
  const { lastDay } = req.query;
  try {
    const expenses = await Expense.find({
      $and: [
        { incurred_on: { $gte: firstDay, $lte: lastDay } },
        { recorded_by: req.auth._id },
      ],
    })
      .sort('incurred_on')
      .populate('recorded_by', '_id name');
    res.json(expenses);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const update = async (req, res) => {
  try {
    let { expense } = req;
    expense = extend(expense, req.body);
    expense.updated = Date.now();
    await expense.save();
    res.json(expense);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    const { expense } = req;
    const deletedExpense = await expense.remove();
    res.json(deletedExpense);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const hasAuthorization = (req, res, next) => {
  const authorized = req.expense
    && req.auth
    && req.expense.recorded_by._id == req.auth._id;
  if (!authorized) {
    return res.status('403').json({
      error: 'User is not authorized',
    });
  }
  next();
};

export default {
  create,
  listByUser,
  expenseByID,
  hasAuthorization,
  update,
  remove,
};
