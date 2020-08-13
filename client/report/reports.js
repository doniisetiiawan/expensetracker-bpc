import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Divider from '@material-ui/core/Divider';
import MonthlyScatter from './monthlyScatter';
import YearlyBar from './yearlyBar';

const useStyles = makeStyles(() => ({
  root: {
    width: '90%',
    maxWidth: '800px',
    margin: 'auto',
    marginTop: 40,
    marginBottom: 40,
  },
  separator: {
    marginBottom: 36,
  },
}));

function Reports() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MonthlyScatter />
      <Divider className={classes.separator} />
      <YearlyBar />
    </div>
  );
}

export default Reports;
