import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import { Redirect } from 'react-router-dom';
import MomentUtils from '@date-io/moment';
import {
  DatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import {
  VictoryPie,
  VictoryTheme,
  VictoryLabel,
} from 'victory';
import Icon from '@material-ui/core/Icon';
import auth from '../auth/auth-helper';
import { averageCategories } from '../expense/api-expense';

const useStyles = makeStyles((theme) => ({
  title: {
    padding: `16px ${theme.spacing(2.5)}px 2px`,
    color: '#2bbd7e',
    display: 'inline',
  },
  search: {
    display: 'flex',
    alignItems: 'center',
  },
  textField: {
    margin: '8px 16px',
    width: 240,
  },
}));

function CategoryPie() {
  const classes = useStyles();
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
  const [redirectToSignin, setRedirectToSignin] = useState(
    false,
  );

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    averageCategories(
      { firstDay, lastDay },
      { t: jwt.token },
      signal,
    ).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setExpenses(data);
      }
    });
    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleDateChange = (name) => (date) => {
    if (name == 'firstDay') {
      setFirstDay(date);
    } else {
      setLastDay(date);
    }
  };

  const searchClicked = () => {
    averageCategories(
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

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }

  return (
    <div>
      <div className={classes.search}>
        <Typography variant="h6" className={classes.title}>
          Expenditures per category
        </Typography>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <DatePicker
            disableFuture
            format="dd/MM/yyyy"
            label="FROM"
            views={['year', 'month', 'date']}
            value={firstDay}
            className={classes.textField}
            onChange={handleDateChange('firstDay')}
          />
          <DatePicker
            format="dd/MM/yyyy"
            label="TO"
            views={['year', 'month', 'date']}
            value={lastDay}
            className={classes.textField}
            onChange={handleDateChange('lastDay')}
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
      {error && (
        <Typography component="p" color="error">
          <Icon color="error">error</Icon>
          {error}
        </Typography>
      )}

      <div style={{ width: 550, margin: 'auto' }}>
        <svg viewBox="0 0 320 320">
          <VictoryPie
            standalone={false}
            data={expenses.monthAVG}
            innerRadius={50}
            theme={VictoryTheme.material}
            labelRadius={({ innerRadius }) => innerRadius + 14}
            labelComponent={(
              <VictoryLabel
                angle={0}
                style={[
                  {
                    fontSize: '11px',
                    fill: '#0f0f0f',
                  },
                  {
                    fontSize: '10px',
                    fill: '#013157',
                  },
                ]}
                text={({ datum }) => `${datum.x}\n $${datum.y}`}
              />
            )}
          />
          <VictoryLabel
            textAnchor="middle"
            style={{ fontSize: 14, fill: '#8b8b8b' }}
            x={175}
            y={170}
            text={'Spent \nper category'}
          />
        </svg>
      </div>
    </div>
  );
}

export default CategoryPie;
