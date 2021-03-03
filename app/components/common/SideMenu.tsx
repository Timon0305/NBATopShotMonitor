import React from 'react';
import routes from '../../constants/routes.json';
import { useHistory, useLocation } from 'react-router';
import getImg from '../../utils/getImg';
import { Button, ButtonGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Apps, Person, History } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    item: {
      height: 150,
      margin: theme.spacing(0),
      borderRadius: 0
    },
    header: {
      height: 64,
      margin: theme.spacing(0),
      // backgroundColor: 'rgba(251, 251, 251, 0.9)',
      borderRadius: 0
    }
  })
);

const SideMenu = () => {

  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  const onPanelClick = (dest: string) => {
    history.push(dest);
    console.log(dest);
  };

  return (
    <>
      <ButtonGroup size={'large'} orientation="vertical" variant="text" style={{ width: '100%' }}>
        <Button color={'secondary'} variant={location.pathname == routes.HOME ? 'contained' : ''}
                className={classes.header}
                onClick={() => onPanelClick(routes.HOME)}
        >
          <img src={getImg('logo.png')} alt="" className="img-fluid logo-img"
               style={{ height: 50 }}/>
        </Button>
        <Button color={'primary'} onClick={() => onPanelClick(routes.MOMENT)}
                className={classes.item} variant={location.pathname == routes.MOMENT ? 'contained' : ''}
                startIcon={<Apps/>}
        >
          Moment
        </Button>
        <Button color={'primary'} onClick={() => onPanelClick(routes.ACCOUNT)}
                className={classes.item} variant={location.pathname == routes.ACCOUNT ? 'contained' : ''}
                startIcon={<Person/>}
        >
          Account
        </Button>
        <Button color={'primary'} onClick={() => onPanelClick(routes.ACTIVITY)}
                className={classes.item} variant={location.pathname == routes.ACTIVITY ? 'contained' : ''}
                startIcon={<History/>}
        >
          Activity
        </Button>

      </ButtonGroup>
    </>
  );
};

export default SideMenu;

