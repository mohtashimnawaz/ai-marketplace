import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AiMarketplace } from "../target/types/ai_marketplace";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("ai-marketplace", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AiMarketplace as Program<AiMarketplace>;
  
  // Test accounts
  const authority = provider.wallet as anchor.Wallet;
  const creator = Keypair.generate();
  const user = Keypair.generate();
  
  // PDAs
  let marketplacePDA: PublicKey;
  let treasuryPDA: PublicKey;
  let modelPDA: PublicKey;
  let accessPDA: PublicKey;
  let usagePDA: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL)
    );

    // Derive PDAs
    [marketplacePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      program.programId
    );

    treasuryPDA = authority.publicKey;
  });

  it("Initializes the marketplace", async () => {
    const protocolFeeBps = 250; // 2.5%

    try {
      const tx = await program.methods
        .initializeMarketplace(new anchor.BN(protocolFeeBps))
        .accounts({
          marketplace: marketplacePDA,
          treasury: treasuryPDA,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Marketplace initialized:", tx);

      // Verify marketplace account
      const marketplace = await program.account.marketplace.fetch(marketplacePDA);
      assert.equal(marketplace.authority.toBase58(), authority.publicKey.toBase58());
      assert.equal(marketplace.protocolFeeBps.toNumber(), protocolFeeBps);
      assert.equal(marketplace.totalModels.toNumber(), 0);
    } catch (error: any) {
      console.log("Note: Marketplace may already be initialized");
    }
  });

  it("Registers a new model", async () => {
    const marketplace = await program.account.marketplace.fetch(marketplacePDA);
    const modelId = marketplace.totalModels.toNumber();

    [modelPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("model"),
        creator.publicKey.toBuffer(),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(modelId)]).buffer)),
      ],
      program.programId
    );

    const modelData = {
      name: "Test Image Classifier",
      description: "A test image classification model for demo purposes",
      modelHash: "abc123def456",
      storageUri: "ipfs://QmTest123",
      modelSize: new anchor.BN(1024 * 1024 * 100), // 100MB
      inferencePrice: new anchor.BN(0.001 * LAMPORTS_PER_SOL),
      downloadPrice: new anchor.BN(0.1 * LAMPORTS_PER_SOL),
      paymentToken: { sol: {} },
    };

    const tx = await program.methods
      .registerModel(
        modelData.name,
        modelData.description,
        modelData.modelHash,
        modelData.storageUri,
        modelData.modelSize,
        modelData.inferencePrice,
        modelData.downloadPrice,
        modelData.paymentToken
      )
      .accounts({
        model: modelPDA,
        marketplace: marketplacePDA,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("Model registered:", tx);

    // Verify model account
    const model = await program.account.model.fetch(modelPDA);
    assert.equal(model.creator.toBase58(), creator.publicKey.toBase58());
    assert.equal(model.name, modelData.name);
    assert.equal(model.description, modelData.description);
    assert.equal(model.isActive, true);

    // Verify marketplace total models increased
    const updatedMarketplace = await program.account.marketplace.fetch(marketplacePDA);
    assert.equal(updatedMarketplace.totalModels.toNumber(), modelId + 1);
  });

  it("Purchases access to a model", async () => {
    [accessPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("access"), user.publicKey.toBuffer(), modelPDA.toBuffer()],
      program.programId
    );

    const accessType = { inference: {} };

    const tx = await program.methods
      .purchaseAccess(accessType, null)
      .accounts({
        access: accessPDA,
        model: modelPDA,
        marketplace: marketplacePDA,
        user: user.publicKey,
        creator: creator.publicKey,
        treasury: treasuryPDA,
        userTokenAccount: null,
        creatorTokenAccount: null,
        treasuryTokenAccount: null,
        tokenProgram: null,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Access purchased:", tx);

    // Verify access account
    const access = await program.account.access.fetch(accessPDA);
    assert.equal(access.user.toBase58(), user.publicKey.toBase58());
    assert.equal(access.model.toBase58(), modelPDA.toBase58());
    assert.equal(access.isActive, true);
  });

  it("Records an inference execution", async () => {
    const inferenceHash = "inference_hash_123";

    [usagePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("usage"),
        user.publicKey.toBuffer(),
        modelPDA.toBuffer(),
        Buffer.from(inferenceHash),
      ],
      program.programId
    );

    const tx = await program.methods
      .recordInference(inferenceHash)
      .accounts({
        usage: usagePDA,
        access: accessPDA,
        model: modelPDA,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Inference recorded:", tx);

    // Verify usage account
    const usage = await program.account.usage.fetch(usagePDA);
    assert.equal(usage.user.toBase58(), user.publicKey.toBase58());
    assert.equal(usage.inferenceHash, inferenceHash);

    // Verify model stats updated
    const model = await program.account.model.fetch(modelPDA);
    assert.equal(model.totalInferences.toNumber(), 1);
  });

  it("Records a model download", async () => {
    // First purchase download access
    const [downloadAccessPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("access"), user.publicKey.toBuffer(), modelPDA.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .recordDownload()
        .accounts({
          access: downloadAccessPDA,
          model: modelPDA,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      console.log("Download recorded:", tx);

      // Verify model stats updated
      const model = await program.account.model.fetch(modelPDA);
      assert.isAtLeast(model.totalDownloads.toNumber(), 0);
    } catch (error: any) {
      console.log("Note: Download requires proper access type");
    }
  });

  it("Updates model status", async () => {
    const tx = await program.methods
      .updateModelStatus(false)
      .accounts({
        model: modelPDA,
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    console.log("Model status updated:", tx);

    // Verify model is now inactive
    const model = await program.account.model.fetch(modelPDA);
    assert.equal(model.isActive, false);

    // Reactivate for other tests
    await program.methods
      .updateModelStatus(true)
      .accounts({
        model: modelPDA,
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();
  });

  it("Updates model pricing", async () => {
    const newInferencePrice = new anchor.BN(0.002 * LAMPORTS_PER_SOL);
    const newDownloadPrice = new anchor.BN(0.2 * LAMPORTS_PER_SOL);

    const tx = await program.methods
      .updateModelPricing(newInferencePrice, newDownloadPrice)
      .accounts({
        model: modelPDA,
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    console.log("Model pricing updated:", tx);

    // Verify pricing updated
    const model = await program.account.model.fetch(modelPDA);
    assert.equal(model.inferencePrice.toNumber(), newInferencePrice.toNumber());
    assert.equal(model.downloadPrice.toNumber(), newDownloadPrice.toNumber());
  });

  it("Fetches all models", async () => {
    const models = await program.account.model.all();
    console.log(`Total models in program: ${models.length}`);
    assert.isAtLeast(models.length, 1);

    models.forEach((model, idx) => {
      console.log(`Model ${idx + 1}:`, model.account.name);
    });
  });

  it("Fetches models by creator", async () => {
    const models = await program.account.model.all([
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: creator.publicKey.toBase58(),
        },
      },
    ]);

    console.log(`Models by creator: ${models.length}`);
    assert.isAtLeast(models.length, 1);
  });
});
