import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Link, withRouter } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import { Home as HomeIcon } from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import auth from '../auth/auth-helper';

const isActive = (history, path) => {
  if (history.location.pathname === path) return { color: '#ff4081' };
  return { color: '#ffffff' };
};

function Menu(props) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit">
            MERN Skeleton
          </Typography>
          <Link to="/">
            <IconButton
              aria-label="Home"
              style={isActive(props.history, '/')}
            >
              <HomeIcon />
            </IconButton>
          </Link>
          <Link to="/users">
            <Button
              style={isActive(props.history, '/users')}
            >
              Users
            </Button>
          </Link>
          {!auth.isAuthenticated() && (
            <span>
              <Link to="/signup">
                <Button
                  style={isActive(props.history, '/signup')}
                >
                  Sign Up
                </Button>
              </Link>
              <Link to="/signin">
                <Button
                  style={isActive(props.history, '/signin')}
                >
                  Sign In
                </Button>
              </Link>
            </span>
          )}
          {auth.isAuthenticated() && (
            <span>
              <Link
                to={`/user/${
                  auth.isAuthenticated().user._id
                }`}
              >
                <Button
                  style={isActive(
                    props.history,
                    `/user/${
                      auth.isAuthenticated().user._id
                    }`,
                  )}
                >
                  My Profile
                </Button>
              </Link>
              <Button
                color="inherit"
                onClick={() => {
                  auth.signout(() => props.history.push('/'));
                }}
              >
                Sign out
              </Button>
            </span>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}

export default withRouter(Menu);
