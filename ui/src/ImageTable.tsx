import React, {useEffect} from 'react';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DockerImage } from './types';


const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}


export default function ImageTable () {
    const [images, setImages] = React.useState<DockerImage[]>([]);
    const ddClient = useDockerDesktopClient();
    useEffect(() => {
        ddClient.docker.listImages().then((res: any) => {
            if (!res) return;
            console.log(res)
            const images = []
            res.map(i => {
                const image: DockerImage = {}
                if (i.RepoTags) {
                    console.log(i.RepoTags)
                    image.repo = i.RepoTags[0].split(":")[0];
                    image.tag = i.RepoTags[0].split(":")[1];
                    image.created = i.Created;
                }
                else {
                    return
                }
                if (image.repo !== '<none>') {
                    image.id = i.Id;
                    images.push(image);
                    image.created = i.Created;
                }

            })
            setImages(images);
        });
    }, [])

    return (
        <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>NAME</TableCell>
              <TableCell>CREATED</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {images.map((image: DockerImage) => (
              <TableRow
                key={image.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {image.repo}:{image.tag}
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell>
                  <Button variant="contained">
                      Run
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
}