import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Button, FormControlLabel, FormGroup, Grid, Link, Switch } from '@mui/material';
import { DataGrid, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetSteps, setMode, setView } from './store/ui';

export function Home() {
  const [containers, setContainers] = useState([]);
  const [showCargp, setShowCargo] = useState(false);
  const ddClient = createDockerDesktopClient();
  const dispatch = useDispatch();

  function gettingStartedLink() {
    ddClient.host.openExternal('https://gefyra.dev/docker-desktop-extension/');
  }

  function getRowId(row: any) {
    return row.Id;
  }

  function openContainer(params: GridRowParams) {
    const id = params.id as string;
    ddClient.desktopUI.navigate.viewContainerLogs(id);
  }

  function handleChangeHideCargo(event: React.ChangeEvent<HTMLInputElement>) {
    setShowCargo(event.target.checked);
  }

  function configureRun() {
    dispatch(setMode('run'));
    dispatch(setView('settings'));
    dispatch(resetSteps());
  }

  const columns = [
    {
      flex: 1,
      field: 'Names',
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;
        const name = row.Names[0].replace('/', '');
        const id = row.Id.substring(0, 12);
        return (
          <div>
            <div>
              <b>{name}</b>
            </div>
            <div>{id}</div>
          </div>
        );
      }
    },
    { flex: 2, field: 'Image', headerName: 'Image' },
    {
      flex: 1,
      field: 'State',
      headerName: 'State',
      renderCell: (params: GridRenderCellParams) => {
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      }
    },
    {
      flex: 1,
      field: 'Ports',
      headerName: 'Ports',
      renderCell: (
        params: GridRenderCellParams<
          Array<{ PrivatPort: Number; PublicPort: Number; Type: string }>
        >
      ) => {
        return params.value.map((port: any) => {
          return (
            <div key={port.PrivatePort} style={{ display: 'block', flex: '0' }}>
              {port.IP && port.IP !== '0.0.0.0' ? port.IP + ':' : ''}
              {port.PublicPort ? port.PublicPort : ''}
              {port.PublicPort ? '->' : ''}
              {port.PrivatePort}/{port.Type}{' '}
            </div>
          );
        });
      }
    },
    { flex: 1, field: 'Status', headerName: 'Status' }
  ];

  function getContainers(): Promise<any> {
    return new Promise((resolve, reject) => {
      let filters = '{"label":["created_by.gefyra.dev=true"], "status": ["running"]}';
      ddClient.docker
        .listContainers({
          all: true,
          filters: filters
        })
        .then((containers: Array<any>) => {
          if (!showCargp) {
            containers = containers.filter((container) => {
              return !container.Names.includes('/gefyra-cargo');
            });
          }
          resolve(containers);
        });
    });
  }

  useEffect(() => {
    getContainers().then((containers: Array<any>) => {
      setContainers(containers);
    });
  }, [showCargp]);

  useEffect(() => {
    getContainers().then((containers: Array<any>) => {
      setContainers(containers);
    });
  }, []);

  return (
    <>
      <Grid item xs={12} sx={{ marginBottom: 3 }} container justifyContent={'space-between'}>
        <div>
          New to Gefyra? Check out the{' '}
          <Link href="#" onClick={gettingStartedLink}>
            Docker Desktop Gefyra Guide
          </Link>
          !
        </div>
        <div>
          <Button
            variant="contained"
            component="label"
            color="primary"
            sx={{ marginTop: 1 }}
            onClick={configureRun}>
            Run Container
          </Button>
          <Button
            variant="contained"
            component="label"
            color="primary"
            sx={{ marginTop: 1, marginLeft: 2 }}
            disabled>
            Bridge Container
          </Button>
        </div>
      </Grid>

      <Grid item xs={12} container>
        <Grid item xs={12} container>
          <FormGroup>
            <FormControlLabel
              control={<Switch onChange={handleChangeHideCargo} />}
              label="Display Gefyra Cargo Containers"
              value={showCargp}
            />
          </FormGroup>
        </Grid>
        <DataGrid
          rows={containers}
          columns={columns}
          pageSize={5}
          autoHeight={true}
          checkboxSelection={false}
          getRowId={getRowId}
          disableSelectionOnClick={true}
          onRowClick={openContainer}
          localeText={{ noRowsLabel: 'No containers found' }}
        />
      </Grid>

      <Grid item xs={12} container></Grid>
    </>
  );
}
