import { createDockerDesktopClient } from '@docker/extension-api-client';
import { K8sImagesRequest, K8sImagesResponse } from 'gefyra/lib/protocol';
import { useEffect, useMemo, useState } from 'react';
import { Gefyra } from '../gefyraClient';
import { DockerImage } from '../types';
import { setSnackbar } from '../store/ui';
import { useDispatch } from 'react-redux';

const useDockerImages = (namespace: string) => {
  const [localImages, setLocalImages] = useState<DockerImage[]>([]);
  const [kubernetesImages, setKubernetesImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const ddClient = createDockerDesktopClient();
    const gefyraClient = new Gefyra(ddClient);
    ddClient.docker.listImages().then((res: any) => {
      setLoading(true);
      if (!res) return;
      const resultImages: DockerImage[] = [];
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
          resultImages.push(image);
        }
      });
      setLoading(false);
      setLocalImages(resultImages);
    });
    const request = new K8sImagesRequest();
    // @ts-ignore
    request.namespace = namespace || 'default';
    gefyraClient.k8sImages(request).then((imageResponse: K8sImagesResponse) => {
      const resultImages: DockerImage[] = [];
      if (!imageResponse.success || !imageResponse.response) {
        setKubernetesImages([]);
        dispatch(setSnackbar({ text: 'Failed to load Kubernetes images', type: 'warning' }));
        return
      };
      imageResponse.response.containers.map((c: { image: string }) => {
        const image = {} as DockerImage;
        image.repo = c.image.split(':')[0];
        image.tag = c.image.split(':')[1] || '';
        image.name = image.tag ? `${image.repo}:${image.tag}` : image.repo;
        image.type = 'Kubernetes';
        resultImages.push(image);
      });
      setKubernetesImages(resultImages);
    });
  }, []);
  const value = useMemo(
    () => {
      const images = [...localImages, ...kubernetesImages];
      // sort images by type then by name
      images.sort((a, b) => {
        if (a.type < b.type) return 1;
        if (a.type > b.type) return -1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      return {
        images,
        loading
      }
    },
    [localImages, kubernetesImages, loading]
  );

  return value;
};

export default useDockerImages;
