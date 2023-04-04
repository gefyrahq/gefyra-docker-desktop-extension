import { createDockerDesktopClient } from '@docker/extension-api-client';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Link,
  Switch,
  Tooltip
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setBridgeContainer, setBridgeNamespace } from './store/gefyra';
import { resetSteps, setMode, setSnackbar, setView } from './store/ui';
import { Gefyra } from './gefyraClient';
import { GefyraListRequest, GefyraUnbridgeRequest } from 'gefyra/lib/protocol';

export function Home() {
  const [containers, setContainers] = useState([]);
  const [bridges, setBridges] = useState([] as Array<string>);
  const [containersLoading, setContainersLoading] = useState(false);
  const [bridgesLoading, setBridgesLoading] = useState(true);
  const [showCargo, setShowCargo] = useState(false);
  const [unbridgeLoadingList, setUnbridgeLoadingList] = useState([] as Array<string>);
  const [containerNamsepaceMap, setContainerNamespaceMap] = useState({} as { [key: string]: string });
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

  function bridgeContainer(containerName: string, namespace: string) {
    dispatch(setBridgeContainer(containerName));
    dispatch(setBridgeNamespace(namespace));
    dispatch(setView('bridge'));
  }

  async function unbridgeContainer(containerName: string) {
    const bridge = bridges.find((bridge) => bridge.includes(containerName + '-to-'));
    if (bridge) {
      const unbridgeRequest = new GefyraUnbridgeRequest();
      unbridgeRequest.name = bridge;
      const gefyraClient = new Gefyra(ddClient);
      setUnbridgeLoadingList([...unbridgeLoadingList, containerName]);
      gefyraClient.unbridge(unbridgeRequest).then(res => {
        if (res.success) {
          setUnbridgeLoadingList(unbridgeLoadingList.filter((name) => name !== containerName));
          getBridges();
          dispatch(setSnackbar({ text: `Unbridge for ${containerName} succeeded.`, type: 'success' }));
        } else {
          dispatch(setSnackbar({ text: `Unbridge for ${containerName} failed.`, type: 'error' }));
        }
      });
    } else {
      console.error('Could not find bridge for container: ' + containerName);
    }
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
          Array<{ PrivatPort: number; PublicPort: number; Type: string }>
        >
      ) => {
        return params.value?.map((port: any) => {
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
    { flex: 1, field: 'Status', headerName: 'Status' },
    {
      flex: 1,
      field: 'Bridge',
      headerName: 'Bridge',
      type: 'actions',
      renderCell: (params: GridRenderCellParams) => {
        if (bridgesLoading) {
          return <CircularProgress size={20} />
        }
        const names = params.row.Names;
        const containerName = names[0].substring(1, names[0].length) as string;
        if (!params.row.Names.includes('/gefyra-cargo')) {
          if (bridges.filter((bridge) => bridge.includes(containerName)).length) {
            return (
              <Tooltip title="Unbridge container">
                <IconButton
                  disabled={unbridgeLoadingList.includes(containerName)}
                  component="label"
                  color="primary"
                  onClick={() => unbridgeContainer(containerName)}>
                  <StopCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            );
          } else {
            return (
              <Tooltip title="Bridge container">
                <IconButton
                  component="label"
                  color="primary"
                  onClick={() => bridgeContainer(containerName, containerNamsepaceMap[containerName])}>
                  <SyncAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            );
          }
        } else {
          return '';
        }
      }
    }
  ];

  function getBridges(): void {
    setBridgesLoading(true);

    const ddClient = createDockerDesktopClient();
    const gefyraClient = new Gefyra(ddClient);
    const listRequest = new GefyraListRequest();
    gefyraClient.list(listRequest).then((response) => {
      if (response.success) {
        response.response.containers.forEach((container: any) => {
          setContainerNamespaceMap((prevState) => ({ ...prevState, [container[0]]: container[2] }));
        });
        setBridges(response.response.bridges);
      }
      setBridgesLoading(false);
    });
  }

  async function refresh() {
    await getContainers();
    getBridges();
  }

  async function getContainers() {
    setContainersLoading(true);
    const filters = '{"label":["created_by.gefyra.dev=true"], "status": ["running"]}';
    return ddClient.docker
      .listContainers({
        all: true,
        filters: filters
      })
      .then((containers: any) => {
        if (!showCargo) {
          containers = containers.filter((container: { Names: string[] }) => {
            return !container.Names.includes('/gefyra-cargo');
          });
        }
        setContainers(containers);
        setContainersLoading(false);
      });
  }

  useEffect(() => {
    getContainers();
  }, [showCargo]);

  useEffect(() => {
    getContainers().then(() => {
      getBridges();
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
        </div>
      </Grid>

      <Grid item xs={12} container>
        <Grid item xs={6} container>
          <FormGroup>
            <FormControlLabel
              control={<Switch onChange={handleChangeHideCargo} />}
              label="Display Gefyra Cargo Containers"
              value={showCargo}
            />
          </FormGroup>
        </Grid>

        <Grid item xs={6} container justifyContent="flex-end">
          <Tooltip title="Refresh table">
            <Button
              variant="contained"
              component="label"
              color="primary"
              onClick={refresh}
              disabled={containersLoading}>
              <RefreshIcon />
            </Button>
          </Tooltip>
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
