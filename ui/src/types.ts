export type DockerImage = {
    repo?: string
    tag?: string
    id?: string
    created?: number
}

export type GefyraStatus = {
    text: string
    action?: string
    help?: string
    loading?: boolean
}

export const statusMap = {
    0: {
        text: 'Missing context',
        action: 'Select a context.',
        help: 'To make sure Gefyra connects to the right cluster please set the correct context. If it is not ' +
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
}