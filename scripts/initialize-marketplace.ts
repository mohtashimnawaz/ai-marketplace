import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AiMarketplace } from "../target/types/ai_marketplace";
import { PublicKey } from "@solana/web3.js";

async function initializeMarketplace() {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AiMarketplace as Program<AiMarketplace>;

  console.log("Program ID:", program.programId.toBase58());
  console.log("Wallet:", provider.wallet.publicKey.toBase58());

  // Derive marketplace PDA
  const [marketplacePda, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace")],
    program.programId
  );

  console.log("\nMarketplace PDA:", marketplacePda.toBase58());

  // Check if already initialized
  try {
    const account = await program.account.marketplace.fetch(marketplacePda);
    console.log("\n✅ Marketplace already initialized!");
    console.log("Authority:", account.authority.toBase58());
    console.log("Total Models:", account.totalModels.toString());
    console.log("Protocol Fee:", account.protocolFeeBps.toString(), "bps");
    return;
  } catch (err) {
    console.log("\nMarketplace not initialized. Initializing...");
  }

  // Derive treasury PDA
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    program.programId
  );

  console.log("Treasury PDA:", treasuryPda.toBase58());

  try {
    // Initialize marketplace with 2.5% protocol fee (250 bps)
    const tx = await program.methods
      .initializeMarketplace(new anchor.BN(250))
      .accountsPartial({
        treasury: treasuryPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Marketplace initialized successfully!");
    console.log("Transaction signature:", tx);
    console.log("\nExplorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Verify initialization
    const account = await program.account.marketplace.fetch(marketplacePda);
    console.log("\nMarketplace Details:");
    console.log("- Authority:", account.authority.toBase58());
    console.log("- Treasury:", account.treasury.toBase58());
    console.log("- Protocol Fee:", account.protocolFeeBps.toString(), "bps (2.5%)");
    console.log("- Total Models:", account.totalModels.toString());

  } catch (error) {
    console.error("\n❌ Error initializing marketplace:");
    console.error(error);
    throw error;
  }
}

initializeMarketplace()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
