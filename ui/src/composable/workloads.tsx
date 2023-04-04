import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Gefyra } from '../gefyraClient';
import { K8sWorkloadsRequest, K8sWorkloadsResponse } from 'gefyra/lib/protocol';
import { useState, useEffect, useMemo } from 'react';

const getWorkloads = async (namespace: string | undefined) => {
  if (namespace) {
    const ddClient = createDockerDesktopClient();
    const gefyraClient = new Gefyra(ddClient);
    const request = new K8sWorkloadsRequest();
    return gefyraClient.k8sWorkloads().then((res) => {
      const wlr: K8sWorkloadsResponse = res;
      // TODO fix in gefyra-json package
      // @ts-ignore
      const workloads = (wlr?.response?.workloads[namespace] as string[]) || undefined;
      return workloads || [];
    });
  }
  return [];
};

export default getWorkloads;
