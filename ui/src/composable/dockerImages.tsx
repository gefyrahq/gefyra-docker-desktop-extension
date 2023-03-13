import { createDockerDesktopClient } from '@docker/extension-api-client';
import { K8sImagesRequest } from 'gefyra/lib/protocol';
import { useEffect, useMemo, useState } from 'react';
import { Gefyra } from '../gefyraClient';
import { DockerImage } from '../types';

const useDockerImages = (namespace: string) => {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ddClient = createDockerDesktopClient();
    const gefyraClient = new Gefyra(ddClient);
    ddClient.docker.listImages().then((res: any) => {
      setLoading(true);
      if (!res) return;
      const images: DockerImage[] = [];
      const names: string[] = [];
      res.map((i: any) => {
        const image = {} as DockerImage;
        if (i.RepoTags) {
          image.repo = i.RepoTags[0].split(':')[0];
          image.tag = i.RepoTags[0].split(':')[1];
          image.created = i.Created;
          image.name = `${image.repo}:${image.tag}`;
        } else {
          return;
        }
        // exclude duplicated image tag / repo
        if (image.repo !== '<none>' && !names.includes(image.name)) {
          names.push(image.name);
          image.id = i.Id;
          image.type = 'local';
          images.push(image);
        }
      });
      setLoading(false);
      setImages((old) => [...old, ...images]);
    });
    const request = new K8sImagesRequest();
    // @ts-ignore
    request.namespace = namespace || 'default';
    gefyraClient.exec(request).then((res) => {
      const imageResponse = JSON.parse(res);
      imageResponse.response.containers.map((c: {image: string}) => {
        const image = {} as DockerImage;
        image.repo = c.image.split(':')[0];
        image.tag = c.image.split(':')[1];
        image.name = `${image.repo}:${image.tag}`;
        image.type = 'Kubernetes';
        images.push(image);
      });
      setImages((old) => [...old, ...images]);
    });
  }, []);
  const value = useMemo(
    () => ({
      images,
      loading
    }),
    [images, loading]
  );

  return value;
};

export default useDockerImages;
