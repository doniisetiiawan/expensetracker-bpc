import { createMuiTheme } from '@material-ui/core';
import { pink } from '@material-ui/core/colors';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#4f83cc',
      main: '#01579b',
      dark: '#002f6c',
      contrastText: '#fff',
    },
    secondary: {
      light: '#9fffe0',
      main: '#69f0ae',
      dark: '#2bbd7e',
      contrastText: '#000',
    },
    openTitle: '#002f6c',
    protectedTitle: '#2bbd7e',
    type: 'light',
  },
});

export default theme;
