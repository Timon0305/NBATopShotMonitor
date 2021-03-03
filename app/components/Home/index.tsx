import React, { useEffect, useState } from 'react';
import Header from '../common/Header';
import { Button, Card, CardActions, CardContent, Typography, Grid } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import MomentUtil from '../../utils/Moments';
import ActivityUtil from '../../utils/Activity';

const useStyles = makeStyles({
  root: {
    minWidth: 275
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  padding: {
    padding: 20
  }
});


function StateCard(props: any) {
  const classes = useStyles();
  const { title, data } = props;

  return (
    <Card className={classes.root} raised={true}>
      <CardContent>
        <Typography className={classes.title} color="primary" gutterBottom>
          {title}
        </Typography>
        <Typography className={classes.pos} color="textPrimary">
          {data}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">See More</Button>
      </CardActions>
    </Card>
  );
}

export default function() {
  const classes = useStyles();

  const [moments, setMoments] = useState([]);
  const [activities, setActivities] = useState([]);

  const loadData = async () => {
    const dbMoments: any = await MomentUtil.get();
    if (dbMoments.updatedAt) {
      setMoments(dbMoments.data);
    }
    const dbActivity: any = await ActivityUtil.get();
    if (dbActivity.updatedAt) {
      setActivities(dbActivity.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Header>
        NBATopShot Monitor v1.0
      </Header>
      <Grid container spacing={0} className={classes.padding}>
        <Grid item xs={3}>
          <StateCard title={'All Moments'} data={moments.length}/>
        </Grid>
        <Grid item xs={1}>
        </Grid>
        <Grid item xs={3}>
          <StateCard title={'Moments Being Monitored'}
                     data={moments.filter((e: any) => e.buyPrice && e.buyPrice > 0).length}/>
        </Grid>
      </Grid>
      <Grid container spacing={0} className={classes.padding}>
        <Grid item xs={3}>
          <StateCard title={'Activities'} data={activities.length}/>
        </Grid>
        <Grid item xs={1}>
        </Grid>
        <Grid item xs={3}>
          <StateCard title={'Bought Moments'} data={moments.filter((e: any) => e.boughtAt && e.buyPrice && e.buyPrice > 0).length}/>
        </Grid>
      </Grid>
    </>
  );
}
