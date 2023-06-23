import { mplex } from "@libp2p/mplex"
import { createLibp2p } from "libp2p"
import { noise } from "@chainsafe/libp2p-noise"
import { circuitRelayServer } from 'libp2p/circuit-relay'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { identifyService } from 'libp2p/identify'
import { createFromPrivKey } from '@libp2p/peer-id-factory'
import { generateKeyPairFromSeed } from '@libp2p/crypto/keys'

const announce = process.env.ANNOUNCE || '/ip4/127.0.0.1/tcp/3000/ws'

const seedHex = process.env.SEED || '00'

const seedContents = Buffer.from(seedHex, 'hex')
const seed = new Uint8Array(32)
seed.set(seedContents)

const privKey = await generateKeyPairFromSeed('ed25519', seed)
const peerId = await createFromPrivKey(privKey)

const server = await createLibp2p({
    peerId,
    addresses: {
        listen: ['/ip4/0.0.0.0/tcp/3000/ws'],
        announce: [
          announce
        ],
    },
    transports: [
        webSockets({
            filter: filters.all
        }),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    services: {
        identify: identifyService(),
        relay: circuitRelayServer()
    }
})

console.log("p2p addr: ", server.getMultiaddrs().map((ma) => ma.toString()))
