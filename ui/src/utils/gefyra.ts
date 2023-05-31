import { GefyraStatusRequest, GefyraUpRequest } from 'gefyra/lib/protocol';
import { Gefyra } from '../gefyraClient';
import { GefyraClientStatus, GefyraClusterStatus } from 'gefyra/lib/types';

export const checkStowawayReady = async (gefyraClient: Gefyra, times = 1): Promise<boolean> => {
  /*
   * Check whether Stowaway is ready and available.
   * `times` determines how often the check is repeated before failing.
   */
  if (times === 0) {
    throw Error('Stowaway is not ready');
  }
  return new Promise((resolve: (value: boolean) => void, reject) => {
    gefyraClient.status().then(async (res) => {
      const response = res.response;
      const cluster = response.cluster;
      if (cluster.stowaway) {
        resolve(true);
      } else {
        setTimeout(() => {
          return checkStowawayReady(gefyraClient, times - 1).catch((err) => reject(err));
        }, 1000);
      }
    });
  });
};

export const checkCargoReady = async (
  gefyraClient: Gefyra,
  times = 1
): Promise<GefyraClientStatus> => {
  /*
   * Check whether Cargo is ready and available.
   * `times` determines how often the check is repeated before failing.
   */
  if (times === 0) {
    throw Error('Cargo is not ready');
  }
  return new Promise((resolve, reject) => {
    gefyraClient.status().then(async (res) => {
      const response = res.response;
      const client = response.client;
      if (client.cargo) {
        resolve(client);
      } else {
        setTimeout(() => {
          return checkCargoReady(gefyraClient, times - 1).catch((err) => reject(err));
        }, 1000);
      }
    });
  });
};

export const gefyraUp = async (gefyraClient: Gefyra, upRequest: GefyraUpRequest) => {
  return gefyraClient
    .exec(upRequest)
    .then((res) => {
      const response = JSON.parse(res);
      const success = response.status === 'success'
      if (!success) {
        throw Error(response.reason);
      }
      return success;
    })
};
