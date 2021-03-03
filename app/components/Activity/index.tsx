import React, { useEffect, useState } from 'react';
import Header, { alert } from '../common/Header';
import { DataGrid, ColDef } from '@material-ui/data-grid';
import { Delete } from '@material-ui/icons';
import { Fab, makeStyles, Theme } from '@material-ui/core';
import { get, set } from '../../utils/Activity';

const useStyles = makeStyles((theme: Theme) => ({
  float: {
    position: 'absolute',
    zIndex: 2000,
    bottom: 40,
    right: 40
  },
  margin: {
    margin: theme.spacing(0)
  }
}));

const columns: ColDef[] = [
  { field: 'at', headerName: 'Time', width: 220 },
  { field: 'type', headerName: 'Type', width: 120 },
  { field: 'result', headerName: 'Result', width: 120 },
  { field: 'data', headerName: 'Details', width: 1000 }
];

export default function Activity() {
  const classes = useStyles();

  const [rows, setRows] = useState([]);

  const loadData = async () => {
    const dbData: any = await get();
    if (!dbData.updatedAt) {
      await set({
        updatedAt: new Date(),
        data: []
      });

      await loadData();
    } else {
      setRows(dbData.data.sort((a: any, b: any) => a.at > b.at ? -1 : 1));
    }
  };

  const clear = async () => {
    await set({
      updatedAt: new Date(),
      data: []
    });
    alert('History cleared');
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Header>
        Activity
      </Header>
      <Fab color={'secondary'} onClick={clear} className={classes.float}>
        <Delete/>
      </Fab>
      <DataGrid
        columns={columns}
        rows={rows}
      />
    </>
  );
};
