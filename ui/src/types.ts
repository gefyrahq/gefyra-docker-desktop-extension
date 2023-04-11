export type DockerImage = {
  repo: string;
  tag?: string;
  id?: string;
  created?: number;
  type: string;
  name: string;
};

export type GefyraStatus = {
  text: string;
  action?: string;
  help?: string;
  loading?: boolean;
};

export type EnvironmentVariable = {
  label: string;
  value: string;
};

export type PortMapping = {
  [host: string]: string;
};

export type VolumeMount = {
  host: string;
  container: string;
};

export type VolumeMountUpdate = {
  index: number;
  volumeMount: VolumeMount;
};

export type PortMappingUpdate = {
  index: number;
  ports: PortMapping;
};

export type SelectItem = {
  label: string;
  value: string;
};

export type SelectProps = {
  loading: boolean;
  value: string;
  label: string;
  items: SelectItem[];
  disabled: boolean;
  id: string;
  labelId: string;
  loadingText?: string;
  handleChange: (e: any, b: any) => void;
};

export type PortMappingsProps = {
  loading?: boolean;
  set: any;
  add: any;
  remove: any;
  state: PortMapping[];
  isValid: (e: any) => void;
}

export type ContainerLogsProps = {
  container: string;
  height: number;
};

export type AutocompleteItem = {
  label: string;
  value: string;
};

export type AutocompleteProps = {
  loading: boolean;
  options: any[];
  disabled: boolean;
  groupBy: string;
  id: string;
  loadingText?: string;
  getOptionLabel: (option: unknown) => string;
  handleChange: (e: any, b: any) => void;
  renderInput: (e: any, b: any) => void;
};

export type GefyraRoute = {
  resetMode: boolean;
  view: string;
  step: number;
};

export const statusMap = {
  0: {
    text: 'Missing context',
    action: 'Select a context.',
    help:
      'To make sure Gefyra connects to the right cluster please set the correct context. If it is not ' +
      'available within the dropdown make sure to select the correct kubeconfig.'
  },
  1: {
    text: 'Gefyra is not installed on the current cluster.',
    action: 'Install Gefyra first.',
    help: 'No Gefyra cluster installation detected. Install Gefyra cluster side components.'
  },
  2: {
    text: 'Checking Gefyra installation',
    loading: true
  },
  3: {
    text: 'Gefyra cluster installation detected.',
    action: 'Please select a namespace.'
  },
  4: {
    text: 'Kubeconfig file not found',
    action: 'Please check your path for the kubeconig file.'
  },
  5: {
    text: 'Loading available namespaces',
    loading: true
  }
};

export type GefyraBridge = {
  name: string;
  container: string;
};

export type GefyraStatusBarProps = {
  error?: boolean;
  label: string;
  progress: number;
};
