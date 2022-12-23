import { GefyraStatusRequest, GefyraUpRequest } from "gefyra/lib/protocol"
import { Gefyra } from "../gefyraClient"

export const checkStowawayReady = async (gefyraClient: Gefyra, times: number = 1, resolver = null, rejecter = null) => {
    /*
     * Check whether Stowaway is ready and available.
     * `times` determines how often the check is repeated before failing.
     */
    const statusRequest = new GefyraStatusRequest()
    if (times === 0) {
        rejecter()
        return
    }
    return new Promise((resolve, reject) => {
            gefyraClient.exec(statusRequest).then(async (res) => {
                const response = JSON.parse(res).response;
                const cluster = response.cluster;
                if (cluster.stowaway) {
                    resolve(true)
                } else {
                    setTimeout(() => {
                        checkStowawayReady(gefyraClient, times - 1, resolver ? resolver : resolve, reject).catch(err => reject()).then(res => resolve(true))
                    }, 1000)
                }
            })
        })
}


export const gefyraUp = async (gefyraClient: Gefyra, upRequest: GefyraUpRequest) => {
    const res = await gefyraClient.exec(upRequest).then((res) => {
        console.log(res)
        const response = JSON.parse(res)
        return response.status === "success"
    }).catch(err => {
        console.log(err)
    })
    return res
}