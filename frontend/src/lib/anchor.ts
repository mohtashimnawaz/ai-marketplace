import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import idl from './idl.json'

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb'
)

export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })
  
  return new Program(idl as any, PROGRAM_ID, provider)
}

export const getMarketplacePDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace')],
    PROGRAM_ID
  )
}

export const getModelPDA = (creator: PublicKey, modelId: number) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('model'),
      creator.toBuffer(),
      Buffer.from(new Uint8Array(new BigUint64Array([BigInt(modelId)]).buffer)),
    ],
    PROGRAM_ID
  )
}

export const getAccessPDA = (user: PublicKey, model: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('access'), user.toBuffer(), model.toBuffer()],
    PROGRAM_ID
  )
}

export const getUsagePDA = (user: PublicKey, model: PublicKey, inferenceHash: string) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('usage'),
      user.toBuffer(),
      model.toBuffer(),
      Buffer.from(inferenceHash),
    ],
    PROGRAM_ID
  )
}
