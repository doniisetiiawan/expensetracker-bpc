import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import {
  DatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {
  VictoryTheme, VictoryScatter, VictoryChart, VictoryTooltip, VictoryLabel,
} from 'victory';
import Icon from '@material-ui/core/Icon';
import auth from '../auth/auth-helper';
import { plotExpenses } from '../expense/api-expense';

const useStyles = makeStyles((theme) => ({
  title: {
    padding: `32px ${theme.spacing(2.5)}px 2px`,
    color: '#2bbd7e',
    display: 'inline',
  },
}));

function MonthlyScatter() {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [plot, setPlot] = useState([]);
  const [month, setMonth] = useState(new Date());
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    plotExpenses({ month }, { t: jwt.token }, signal).then(
      (data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPlot(data);
        }
      },
    );
    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleDateChange = (date) => {
    setMonth(date);
    plotExpenses({ month: date }, { t: jwt.token }).then(
      (data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPlot(data);
        }
      },
    );
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <Typography variant="h6" className={classes.title}>
        Expenses scattered over
      </Typography>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DatePicker
          value={month}
          onChange={handleDateChange}
          views={['year', 'month']}
          disableFuture
          label="Month"
          animateYearScrolling
          variant="inline"
        />
      </MuiPickersUtilsProvider>
      {error && (
        <Typography component="p" color="error">
          <Icon color="error">error</Icon>
          {error}
        </Typography>
      )}

      <VictoryChart
        theme={VictoryTheme.material}
        height={400}
        width={550}
        domainPadding={40}
      >
        <VictoryScatter
          style={{
            data: { fill: '#01579b', stroke: '#69f0ae', strokeWidth: 2 },
            labels: { fill: '#01579b', fontSize: 10, padding: 8 },
          }}
          bubbleProperty="y"
          maxBubbleSize={15}
          minBubbleSize={5}
          labels={({ datum }) => `$${datum.y} on ${datum.x}th`}
          labelComponent={<VictoryTooltip />}
          data={plot}
          domain={{ x: [0, 31] }}
        />
        <VictoryLabel
          textAnchor="middle"
          style={{ fontSize: 14, fill: '#8b8b8b' }}
          x={270}
          y={390}
          text="day of month"
        />
        <VictoryLabel
          textAnchor="middle"
          style={{ fontSize: 14, fill: '#8b8b8b' }}
          x={6}
          y={190}
          angle={270}
          text="Amount ($)"
        />
      </VictoryChart>
    </div>
  );
}

export default MonthlyScatter;
