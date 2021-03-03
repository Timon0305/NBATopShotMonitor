import React from 'react';
import { Grid } from '@material-ui/core';
import SideMenu from '../components/common/SideMenu';
import Activity from '../components/Activity';

export default function ActivityPage() {
  console.log('activity');

  return <Grid container className={'full-height'}>
    <Grid item xs={2} sm={2} className={'right-border'}>
      <SideMenu/>
    </Grid>
    <Grid item xs={10} sm={10}>
      <Activity/>
    </Grid>
  </Grid>;
}
