import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux'
import { setMode, setView, setSteps, setActiveStep } from './store/ui'


type ModeProps = {
    image: string
    imageAlt: string
    headline: string
    caption: string
    mode: string
    disabled?: boolean
}

const steps = {
    run: [
        { label: 'Mode (Run)' },
        { label: 'Kubernetes Settings' },
        { label: 'Container Settings' },
        { label: 'Execute' },
    ],
    bridge: [
        { label: 'Mode (Bridge)' },
        { label: 'Kubernetes Settings' },
        { label: 'Container Settings' },
        { label: 'Execute' },
    ],
}

export function Mode(props: ModeProps) {
    const dispatch = useDispatch()
    function activateMode () {
        dispatch(setMode(props.mode))  
        dispatch(setView('settings'))  
        dispatch(setSteps(steps[props.mode]))  
        dispatch(setActiveStep(1))
    }

    const styles = {
        px: 4,
        pt: 3,
        maxWidth: '80%',
        cursor: 'pointer',
        pointerEvents: props.disabled ? 'none': 'default',
        opacity: props.disabled ? '0.5': '1',
    }

    return (    
        <>
            <Card sx={styles} onClick={activateMode}>
                <CardMedia
                    onClick={activateMode}
                    component="img"
                    height=""
                    image={props.image}
                    alt={props.imageAlt}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.headline}
                    </Typography>
                    <Typography gutterBottom variant="body1" component="p">
                        {props.caption}
                    </Typography>
                </CardContent>
            </Card>
        </>
    )
}
