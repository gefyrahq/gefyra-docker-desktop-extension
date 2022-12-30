import { createDockerDesktopClient } from '@docker/extension-api-client';
import { useEffect, useMemo, useState } from 'react';
import { DockerImage } from '../types';

const useDockerImages = () => {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);

  const ddClient = createDockerDesktopClient();

  useEffect(() => {
    ddClient.docker.listImages().then((res: any) => {
      setLoading(true);
      if (!res) return;
      const images = [];
      const names = [];
      res.map((i) => {
        const image: DockerImage = {};
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
      setImages(images);
      console.log(images);
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
