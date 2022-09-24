import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Button, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React from "react";
import { statusMap } from "./types";
import { Kubectl } from "./utils/kubectl";
import { GefyraStatus } from "./types";

const ddClient = createDockerDesktopClient();
const loading = 'Loading...';
const kubectl = new Kubectl(ddClient);

export class Settings extends React.Component {
    state = {
        kubeconfig: '',
        availableNamespaces: [],
        namespace: '',
        availableContexts: [],
        context: '',
        namespaceInputActive: false,
        status: {}
    }

    loadContexts() {
        this.setState({
            availableNamespaces: ['Select context first'],
            availableContexts: [loading],
            context: loading,
            namespace: 'Select context first'
        })
        kubectl.getContexts(this.state.kubeconfig).then((contexts) => {
            if (!contexts.error) {
                this.setState({
                    availableContexts: ['No context selected'].concat(contexts.value),
                    context: 'No context selected',
                });
            } else {
                this.setState({status: statusMap[4]})
            }
        })
    }

    async handleKubeConfigChange (e) {
        const result = await ddClient.desktopUI.dialog.showOpenDialog({
            filters: [{
                extensions: ['yaml', 'yml']
            }],
            properties: ["openFile"],
        });
        if (!result.canceled) {
          const directory = result.filePaths.shift();
          if (directory !== undefined) {
              this.setState({kubeconfig: directory})
          }
        }

    };

    async handleContextChange (e, b) {

        this.setState({
            context: e.target.value,
            availableNamespaces: [loading],
            namespace: loading
        })
        this.setState({status: statusMap[5]})
        kubectl.getNamespaces(e.target.value, this.state.kubeconfig).then((namespaces) => {
            const select = 'Select a namespace'
            this.setState({
                availableNamespaces: [select].concat(namespaces),
                namespace: 'Select a namespace',
                namespaceInputActive: true
            })
            this.setState({status: statusMap[2]})
        })
    }

    async handleNamespaceChange (e, b) {
        await this.setState({namespace: e.target.value})
    }

    render() {
        return (
            <>
                <Grid item xs={6}>
                    <InputLabel sx={{ mb: 1 }} id="kubeconfig-label">Kubeconfig</InputLabel>
                    <TextField id="kubeconfig" variant="outlined" fullWidth disabled value={this.state.kubeconfig} />
                    <Button
                        variant="contained"
                        component="label"
                        color="primary"
                        onClick={this.handleKubeConfigChange}
                        sx={{ marginTop: 1 }}
                    >
                        Choose Kubeconfig
                    </Button>
                    <InputLabel sx={{ mb: 1, mt: 2 }} id="context-select-label">Context</InputLabel>
                    <Select labelId="context-select-label" id="context-select" value={this.state.context} label="Context"
                        onChange={this.handleContextChange}>
                        {this.state.availableContexts.map((name, index) => (
                            <MenuItem key={name} value={name} disabled={index === 0}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                    <InputLabel sx={{ mb: 1, mt: 2 }} id="namespace-select-label">Namespace</InputLabel>
                    <Select labelId="namespace-select-label" id="namespace-select" value={this.state.namespace} label="Namespace"
                        onChange={this.handleNamespaceChange} disabled={!this.state.namespaceInputActive}>
                        {this.state.context ? this.state.availableNamespaces.map((name, index) => (
                            <MenuItem key={name} value={name} divider={index === 0} disabled={index === 0}>
                                {name}
                            </MenuItem>
                        )) : <MenuItem>Please select a valid context.</MenuItem>}
                    </Select>
                </Grid>
            </>
        )
    }
}
