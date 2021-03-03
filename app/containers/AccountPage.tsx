import React from 'react';
import { Grid } from '@material-ui/core';
import SideMenu from '../components/common/SideMenu';
import Account from '../components/Account';

export default function AccountPage() {
  return <Grid container className={'full-height'}>
    <Grid item xs={2} sm={2} className={'right-border'}>
      <SideMenu/>
    </Grid>
    <Grid item xs={10} sm={10}>
      <Account/>
    </Grid>
  </Grid>;
}
