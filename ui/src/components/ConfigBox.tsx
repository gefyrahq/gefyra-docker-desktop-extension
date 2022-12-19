import { Card, List, ListItem, ListItemText } from "@mui/material"
import { Box } from "@mui/system"
import { TypedUseSelectorHook, useSelector } from "react-redux"
import { RootState } from "../store"



export function ConfigBox() {
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const context = useAppSelector(state => state.gefyra.context)
    const image = useAppSelector(state => state.gefyra.image)
    const namespace = useAppSelector(state => state.gefyra.namespace)
    const environmentVariables = useAppSelector(state => state.gefyra.environmentVariables)
    const volumeMounts = useAppSelector(state => state.gefyra.volumeMounts)

    const styles = {
        height: '100%',
        bgcolor: 'dark',
        px: 1,
        py: 1,
        color: 'grey.300',
    }

    return (
    <Card variant="outlined">
        <Box sx={styles}>
            <List>
                <ListItem>
                    <ListItemText>
                        Kubeconfig: {kubeconfig}
                    </ListItemText>
                    </ListItem>
                    <ListItem>
                    <ListItemText>
                        Context: {context}
                    </ListItemText>
                    </ListItem>
                    <ListItem>
                    <ListItemText>
                        Image: {image}
                    </ListItemText>
                    </ListItem>
                    <ListItem>
                    <ListItemText>
                        Namespace: {namespace}
                    </ListItemText>
                    </ListItem>
            </List>
        </Box>
    </Card>
    )

}