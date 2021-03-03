import React from 'react';
import Moment from '../components/Moment';
import { Grid } from '@material-ui/core';
import SideMenu from '../components/common/SideMenu';

export default function MomentPage() {
  return <Grid container className={'full-height'}>
    <Grid item xs={2} sm={2} className={'right-border'}>
      <SideMenu/>
    </Grid>
    <Grid item xs={10} sm={10}>
      <Moment/>
    </Grid>
  </Grid>;
}
