import extend from 'lodash/extend';
import mongoose from 'mongoose';
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

const currentMonthPreview = async (req, res) => {
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date();
  yesterday.setUTCHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    const currentPreview = await Expense.aggregate([
      {
        $facet: {
          month: [
            {
              $match: {
                incurred_on: {
                  $gte: firstDay,
                  $lt: lastDay,
                },
                recorded_by: mongoose.Types.ObjectId(
                  req.auth._id,
                ),
              },
            },
            {
              $group: {
                _id: 'currentMonth',
                totalSpent: { $sum: '$amount' },
              },
            },
          ],
          today: [
            {
              $match: {
                incurred_on: { $gte: today, $lt: tomorrow },
                recorded_by: mongoose.Types.ObjectId(
                  req.auth._id,
                ),
              },
            },
            {
              $group: {
                _id: 'today',
                totalSpent: { $sum: '$amount' },
              },
            },
          ],
          yesterday: [
            {
              $match: {
                incurred_on: {
                  $gte: yesterday,
                  $lt: today,
                },
                recorded_by: mongoose.Types.ObjectId(
                  req.auth._id,
                ),
              },
            },
            {
              $group: {
                _id: 'yesterday',
                totalSpent: { $sum: '$amount' },
              },
            },
          ],
        },
      },
    ]);
    const expensePreview = {
      month: currentPreview[0].month[0],
      today: currentPreview[0].today[0],
      yesterday: currentPreview[0].yesterday[0],
    };
    res.json(expensePreview);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const expenseByCategory = async (req, res) => {
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  try {
    const categoryMonthlyAvg = await Expense.aggregate([
      {
        $facet: {
          average: [
            {
              $match: {
                recorded_by: mongoose.Types.ObjectId(
                  req.auth._id,
                ),
              },
            },
            {
              $group: {
                _id: {
                  category: '$category',
                  month: { $month: '$incurred_on' },
                },
                totalSpent: { $sum: '$amount' },
              },
            },
            {
              $group: {
                _id: '$_id.category',
                avgSpent: { $avg: '$totalSpent' },
              },
            },
            {
              $project: {
                _id: '$_id',
                value: { average: '$avgSpent' },
              },
            },
          ],
          total: [
            {
              $match: {
                incurred_on: {
                  $gte: firstDay,
                  $lte: lastDay,
                },
                recorded_by: mongoose.Types.ObjectId(
                  req.auth._id,
                ),
              },
            },
            {
              $group: {
                _id: '$category',
                totalSpent: { $sum: '$amount' },
              },
            },
            {
              $project: {
                _id: '$_id',
                value: { total: '$totalSpent' },
              },
            },
          ],
        },
      },
      {
        $project: {
          overview: { $setUnion: ['$average', '$total'] },
        },
      },
      { $unwind: '$overview' },
      { $replaceRoot: { newRoot: '$overview' } },
      {
        $group: {
          _id: '$_id',
          mergedValues: { $mergeObjects: '$value' },
        },
      },
    ]).exec();
    res.json(categoryMonthlyAvg);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const yearlyExpenses = async (req, res) => {
  const y = req.query.year;
  const firstDay = new Date(y, 0, 1);
  const lastDay = new Date(y, 12, 0);
  try {
    const totalMonthly = await Expense.aggregate([
      {
        $match: {
          incurred_on: { $gte: firstDay, $lt: lastDay },
          recorded_by: mongoose.Types.ObjectId(req.auth._id),
        },
      },
      {
        $group: {
          _id: { $month: '$incurred_on' },
          totalSpent: { $sum: '$amount' },
        },
      },
      { $project: { x: '$_id', y: '$totalSpent' } },
    ]).exec();
    res.json({ monthTot: totalMonthly });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const plotExpenses = async (req, res) => {
  const date = new Date(req.query.month);
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  try {
    const totalMonthly = await Expense.aggregate([
      {
        $match: {
          incurred_on: { $gte: firstDay, $lt: lastDay },
          recorded_by: mongoose.Types.ObjectId(req.auth._id),
        },
      },
      {
        $project: {
          x: { $dayOfMonth: '$incurred_on' },
          y: '$amount',
        },
      },
    ]).exec();
    res.json(totalMonthly);
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
  currentMonthPreview,
  expenseByCategory,
  plotExpenses,
  yearlyExpenses,
};
