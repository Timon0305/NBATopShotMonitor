import React, { useEffect, useState } from 'react';
import Header, { alert } from '../common/Header';
import SwipeableViews from 'react-swipeable-views';
import {
  Box, Fab, FormControl, Grid, InputLabel, MenuItem, Select,
  Tab, Tabs, TextField,
  Typography
} from '@material-ui/core';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { Refresh, Save } from '@material-ui/icons';
import { get, update } from '../../utils/Account';
import CreditCardInput from 'react-credit-card-input';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}


const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500
  },
  bottomTab: {
    width: '100%',
    position: 'relative',
    bottom: 0,
    right: 0,
    textAlign: 'center'
  },
  float: {
    position: 'absolute',
    zIndex: 2000,
    bottom: 40,
    right: 40
  }
}));

const initData = {
  updatedAt: '',
  credential: { email: '', password: '' },
  ccInfo: { number: '', expiry: '', name: '', cvc: '' },
  billing: { address1: '', address2: '', city: '', state: '', postal: '' }
};

export default function Account() {
  const classes = useStyles();
  const theme = useTheme();

  // Tab Change
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  // Data
  const [data, setData] = useState(initData);

  // load data
  const loadData = async () => {
    const dbData: any = await get();
    if (dbData.updatedAt) {
      setData(dbData);
    }
  };

  // reset data
  const reset = async () => {
    console.log('account-reset');
    await loadData();
  };

  // save data
  const save = async () => {
    console.log('account-save');
    await update(data);
    alert('Successfully saved');
    await loadData();
  };

  // change data
  const handleDataChange = (cat: string, key: string, val: string) => {
    let new_data: any = { ...data };
    new_data[cat][key] = val;
    setData(new_data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Header>
        Account
      </Header>
      <div className={classes.float}>
        <Fab color={'secondary'} onClick={reset}>
          <Refresh/>
        </Fab>
        {' '}
        <Fab color={'primary'} onClick={save}>
          <Save/>
        </Fab>
      </div>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        // variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Credential" {...a11yProps(0)} />
        <Tab label="Payment" {...a11yProps(1)} />
        <Tab label="Billing" {...a11yProps(2)} />
      </Tabs>

      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <FormControl className='full-width'>
                <TextField
                  id="standard-textarea"
                  label="Email"
                  placeholder="example@gmail.com"
                  value={data.credential.email}
                  onChange={(e: any) => handleDataChange('credential', 'email', e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl className='full-width'>
                <TextField
                  id="standard-textarea"
                  label="Password"
                  placeholder="********"
                  value={data.credential.password}
                  onChange={(e: any) => handleDataChange('credential', 'password', e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl className='full-width'>
                <TextField
                  id="standard-textarea"
                  label="Holder Name"
                  placeholder="John Doe"
                  value={data.ccInfo.name}
                  onChange={(e: any) => handleDataChange('ccInfo', 'name', e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <CreditCardInput
                cardNumberInputProps={{
                  defaultValue: data.ccInfo.number,
                  onBlur: (e: any) => handleDataChange('ccInfo', 'number', e.target.value)
                }}
                cardExpiryInputProps={{
                  defaultValue: data.ccInfo.expiry,
                  onBlur: (e: any) => handleDataChange('ccInfo', 'expiry', e.target.value)
                }}
                cardCVCInputProps={{
                  defaultValue: data.ccInfo.cvc,
                  onBlur: (e: any) => handleDataChange('ccInfo', 'cvc', e.target.value)
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl className='full-width'>
                <TextField
                  id="standard-textarea"
                  label="Address Line 1"
                  placeholder="701 Boardwalk"
                  value={data.billing.address1}
                  onChange={(e: any) => handleDataChange('billing', 'address1', e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className='full-width'>
                <TextField
                  id="standard-textarea"
                  label="Address Line 2"
                  placeholder="(Optional)"
                  value={data.billing.address2}
                  onChange={(e: any) => handleDataChange('billing', 'address2', e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-textarea"
                label="City"
                placeholder="Edinburg"
                value={data.billing.city}
                onChange={(e: any) => handleDataChange('billing', 'city', e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              {/*<TextField*/}
              {/*id="standard-textarea"*/}
              {/*label="State"*/}
              {/*placeholder="TX"*/}
              {/*value={data.billing.state}*/}
              {/*onChange={(e: any) => handleDataChange('billing', 'state', e.target.value)}*/}
              {/*/>*/}
              <FormControl>
                <InputLabel id="demo-simple-select-outlined-label">State</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={data.billing.state}
                  onChange={(e: any) => handleDataChange('billing', 'state', e.target.value)}
                  label="Age"
                >
                  <MenuItem value="">--</MenuItem>
                  <MenuItem value="AL">Alabama</MenuItem>
                  <MenuItem value="AK">Alaska</MenuItem>
                  <MenuItem value="AS">American Samoa</MenuItem>
                  <MenuItem value="AZ">Arizona</MenuItem>
                  <MenuItem value="AR">Arkansas</MenuItem>
                  <MenuItem value="CA">California</MenuItem>
                  <MenuItem value="CO">Colorado</MenuItem>
                  <MenuItem value="CT">Connecticut</MenuItem>
                  <MenuItem value="DE">Delaware</MenuItem>
                  <MenuItem value="DC">District of Columbia</MenuItem>
                  <MenuItem value="FM">Micronesia</MenuItem>
                  <MenuItem value="FL">Florida</MenuItem>
                  <MenuItem value="GA">Georgia</MenuItem>
                  <MenuItem value="GU">Guam</MenuItem>
                  <MenuItem value="HI">Hawaii</MenuItem>
                  <MenuItem value="ID">Idaho</MenuItem>
                  <MenuItem value="IL">Illinois</MenuItem>
                  <MenuItem value="IN">Indiana</MenuItem>
                  <MenuItem value="IA">Iowa</MenuItem>
                  <MenuItem value="KS">Kansas</MenuItem>
                  <MenuItem value="KY">Kentucky</MenuItem>
                  <MenuItem value="LA">Louisiana</MenuItem>
                  <MenuItem value="ME">Maine</MenuItem>
                  <MenuItem value="MH">Marshall Islands</MenuItem>
                  <MenuItem value="MD">Maryland</MenuItem>
                  <MenuItem value="MA">Massachusetts</MenuItem>
                  <MenuItem value="MI">Michigan</MenuItem>
                  <MenuItem value="MN">Minnesota</MenuItem>
                  <MenuItem value="MS">Mississippi</MenuItem>
                  <MenuItem value="MO">Missouri</MenuItem>
                  <MenuItem value="MT">Montana</MenuItem>
                  <MenuItem value="NE">Nebraska</MenuItem>
                  <MenuItem value="NV">Nevada</MenuItem>
                  <MenuItem value="NH">New Hampshire</MenuItem>
                  <MenuItem value="NJ">New Jersey</MenuItem>
                  <MenuItem value="NM">New Mexico</MenuItem>
                  <MenuItem value="NY">New York</MenuItem>
                  <MenuItem value="NC">North Carolina</MenuItem>
                  <MenuItem value="ND">North Dakota</MenuItem>
                  <MenuItem value="MP">Northern Mariana Islands</MenuItem>
                  <MenuItem value="OH">Ohio</MenuItem>
                  <MenuItem value="OK">Oklahoma</MenuItem>
                  <MenuItem value="OR">Oregon</MenuItem>
                  <MenuItem value="PW">Palau</MenuItem>
                  <MenuItem value="PA">Pennsylvania</MenuItem>
                  <MenuItem value="PR">Puerto Rico</MenuItem>
                  <MenuItem value="RI">Rhode Island</MenuItem>
                  <MenuItem value="SC">South Carolina</MenuItem>
                  <MenuItem value="SD">South Dakota</MenuItem>
                  <MenuItem value="TN">Tennessee</MenuItem>
                  <MenuItem value="TX">Texas</MenuItem>
                  <MenuItem value="UT">Utah</MenuItem>
                  <MenuItem value="VI">Virgin Islands</MenuItem>
                  <MenuItem value="VA">Virginia</MenuItem>
                  <MenuItem value="WA">Washington</MenuItem>
                  <MenuItem value="WV">West Virginia</MenuItem>
                  <MenuItem value="WI">Wisconsin</MenuItem>
                  <MenuItem value="WY">Wyoming</MenuItem>
                  <MenuItem value="AA">Armed Forces Americas</MenuItem>
                  <MenuItem value="AE">Armed Forces Europe, Canada, Africa and Middle East</MenuItem>
                  <MenuItem value="AP">Armed Forces Pacific</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-textarea"
                label="Postal Code"
                placeholder="78539"
                value={data.billing.postal}
                onChange={(e: any) => handleDataChange('billing', 'postal', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </SwipeableViews>
    </>
  );
};
