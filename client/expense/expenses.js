import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import MomentUtils from '@date-io/moment';
import {
  DatePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { Edit } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import { Redirect } from 'react-router-dom';
import auth from '../auth/auth-helper';
import { listByUser } from './api-expense';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '90%',
    maxWidth: '800px',
    margin: 'auto',
    marginTop: 40,
    marginBottom: 40,
  },
  heading: {
    fontSize: '1.5em',
    fontWeight: theme.typography.fontWeightRegular,

    marginTop: 12,
    marginBottom: 4,
  },
  error: {
    verticalAlign: 'middle',
  },
  notes: {
    color: 'grey',
  },
  panel: {
    border: '1px solid #58bd7f',
    margin: 6,
  },
  info: {
    marginRight: 32,
    width: 90,
  },
  amount: {
    fontSize: '2em',
    color: '#2bbd7e',
  },
  search: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textField: {
    margin: '8px 16px',
    width: 240,
  },
  buttons: {
    textAlign: 'right',
  },
  status: {
    marginRight: 8,
  },
  date: {
    fontSize: '1.1em',
    color: '#8b8b8b',
    marginTop: 4,
  },
}));

function Expenses() {
  const classes = useStyles();
  const [redirectToSignin, setRedirectToSignin] = useState(
    false,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const jwt = auth.isAuthenticated();
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const [firstDay, setFirstDay] = useState(
    new Date(y, m, 1),
  );
  const [lastDay, setLastDay] = useState(
    new Date(y, m + 1, 0),
  );

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    listByUser(
      { firstDay, lastDay },
      { t: jwt.token },
      signal,
    ).then((data) => {
      if (data.error) {
        setRedirectToSignin(true);
      } else {
        setExpenses(data);
      }
    });
    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleSearchFieldChange = (name) => (date) => {
    if (name == 'firstDay') {
      setFirstDay(date);
    } else {
      setLastDay(date);
    }
  };

  const searchClicked = () => {
    listByUser(
      { firstDay, lastDay },
      { t: jwt.token },
    ).then((data) => {
      if (data.error) {
        setRedirectToSignin(true);
      } else {
        setExpenses(data);
      }
    });
  };

  const handleChange = (name, index) => (event) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][name] = event.target.value;
    setExpenses(updatedExpenses);
  };

  const handleDateChange = (index) => (date) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].incurred_on = date;
    setExpenses(updatedExpenses);
  };

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.search}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <DatePicker
            disableFuture
            format="dd/MM/yyyy"
            label="SHOWING RECORDS FROM"
            className={classes.textField}
            views={['year', 'month', 'date']}
            value={firstDay}
            onChange={handleSearchFieldChange('firstDay')}
          />
          <DatePicker
            format="dd/MM/yyyy"
            label="TO"
            className={classes.textField}
            views={['year', 'month', 'date']}
            value={lastDay}
            onChange={handleSearchFieldChange('lastDay')}
          />
        </MuiPickersUtilsProvider>
        <Button
          variant="contained"
          color="secondary"
          onClick={searchClicked}
        >
          GO
        </Button>
      </div>

      {expenses.map((expense, index) => (
        <span key={index}>
          <ExpansionPanel className={classes.panel}>
            <ExpansionPanelSummary expandIcon={<Edit />}>
              <div className={classes.info}>
                <Typography className={classes.amount}>
                  $
                  {expense.amount}
                </Typography>
                <Divider
                  style={{ marginTop: 4, marginBottom: 4 }}
                />
                <Typography>{expense.category}</Typography>
                <Typography className={classes.date}>
                  {new Date(
                    expense.incurred_on,
                  ).toLocaleDateString()}
                </Typography>
              </div>
              <div>
                <Typography className={classes.heading}>
                  {expense.title}
                </Typography>
                <Typography className={classes.notes}>
                  {expense.notes}
                </Typography>
              </div>
            </ExpansionPanelSummary>
            <Divider />
            <ExpansionPanelDetails
              style={{ display: 'block' }}
            >
              <div>
                <TextField
                  label="Title"
                  className={classes.textField}
                  value={expense.title}
                  onChange={handleChange('title', index)}
                  margin="normal"
                />
                <TextField
                  label="Amount ($)"
                  className={classes.textField}
                  value={expense.amount}
                  onChange={handleChange('amount', index)}
                  margin="normal"
                  type="number"
                />
              </div>
              <div>
                <MuiPickersUtilsProvider
                  utils={MomentUtils}
                >
                  <DateTimePicker
                    label="Incurred on"
                    className={classes.textField}
                    views={['year', 'month', 'date']}
                    value={expense.incurred_on}
                    onChange={handleDateChange(index)}
                    showTodayButton
                  />
                </MuiPickersUtilsProvider>
                <TextField
                  label="Category"
                  className={classes.textField}
                  value={expense.category}
                  onChange={handleChange('category', index)}
                  margin="normal"
                />
              </div>
              <TextField
                label="Notes"
                multiline
                rows="2"
                value={expense.notes}
                onChange={handleChange('notes', index)}
                className={classes.textField}
                margin="normal"
              />
              <div className={classes.buttons}>
                {error && (
                  <Typography component="p" color="error">
                    <Icon
                      color="error"
                      className={classes.error}
                    >
                      error
                    </Icon>
                    {error}
                  </Typography>
                )}
                {saved && (
                  <Typography
                    component="span"
                    color="secondary"
                    className={classes.status}
                  >
                    Saved
                  </Typography>
                )}
                <Button
                  color="primary"
                  variant="contained"
                  // onClick={() => clickUpdate(index)}
                  className={classes.submit}
                >
                  Update
                </Button>
                {/* <DeleteExpense */}
                {/*  expense={expense} */}
                {/*  onRemove={removeExpense} */}
                {/* /> */}
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </span>
      ))}
    </div>
  );
}

export default Expenses;
