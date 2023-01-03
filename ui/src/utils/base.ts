import { createDockerDesktopClient } from '@docker/extension-api-client';

export const openLink = (url: string): void => {
  const client = createDockerDesktopClient();
  client.host.openExternal(url);
};
