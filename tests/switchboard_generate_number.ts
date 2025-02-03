import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { SwitchboardGenerateNumber } from "../target/types/switchboard_generate_number";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  AnchorUtils,
  InstructionUtils,
  Queue,
  Randomness,
  SB_ON_DEMAND_PID,
  sleep,
} from "@switchboard-xyz/on-demand";
import { Keypair } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import dotenv from "dotenv";
import { IDL } from "./idl";
import * as fs from "fs";
import reader from "readline-sync";

async function myAnchorProgram(
  provider: anchor.Provider,
  myPid: PublicKey
): Promise<anchor.Program> {
  const idl = (await anchor.Program.fetchIdl(myPid, provider))!;
  const program = new anchor.Program(idl, provider);
  return program;
}

function pauseForEffect(message: any, duration = 500) {
  console.log(message);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

describe("switchboard_generate_number", () => {
  const PLAYER_STATE_SEED = "playerState";
  const ESCROW_SEED = "stateEscrow";
  const COMMITMENT = "confirmed";

  // Configure the client to use the local cluster.
  const providerWeb3 = anchor.AnchorProvider.env();
  anchor.setProvider(providerWeb3);
  const payer = providerWeb3.wallet as anchor.Wallet;

  // const program = anchor.workspace
  //   .SwitchboardGenerateNumber as Program<SwitchboardGenerateNumber>;
  const coinFlipProgramId = new anchor.web3.PublicKey(
    "5p3k3TUCfwYof4HLVsjDgLcWv21YxkPccHMJCXX4AEA2"
  );
  const [playerStateAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(PLAYER_STATE_SEED), payer.publicKey.toBuffer()],
    coinFlipProgramId
  );

  // Find the escrow account PDA
  const [escrowAccount, escrowBump] = PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED)],
    coinFlipProgramId
  );
  console.log("Escrow account", escrowAccount.toString());
  console.log("Player state account", playerStateAccount.toString());
  console.log("");

  it("Initialized! User State", async () => {
    // // Add your test here.
    // const tx = await program.methods
    //   .initialize()
    //   .accounts({
    //     playerState: playerStateAccount,
    //     user: payer.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .rpc();
    // console.log("Your transaction signature", tx);
  });

  it("Coin Flip from user", async () => {
    dotenv.config();
    console.clear();
    const { keypair, connection, provider, wallet } =
      await AnchorUtils.loadEnv();
    if (fileExists("serializedIx.bin")) {
      console.log("A pending request has been found in the ether. Resuming...");
      const bin = fs.readFileSync("serializedIx.bin");
      const tx = VersionedTransaction.deserialize(bin);
      tx.message.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      tx.sign([keypair]);
      const sig = await connection.sendTransaction(tx);
      await connection.confirmTransaction(sig);
      console.log(
        "\n💫 With bated breath, we watched as the oracle unveiled our destiny: 💫"
      );
      let transactionRes = await connection.getTransaction(sig, {
        maxSupportedTransactionVersion: 0,
      });
      let resultLog = transactionRes?.meta?.logMessages?.filter((line) =>
        line.includes("FLIP_RESULT")
      )[0];
      let result = resultLog?.split(": ")[2];

      console.log(`\nDestiny reveals itself as... ${result}!`);
      fs.unlinkSync("serializedIx.bin");
      return;
    }
    const payer = wallet.payer;
    // Switchboard sbQueue fixed
    const sbQueue = new PublicKey(
      "FfD96yeXs4cxZshoPPSKhSPgVQxLAJUT3gefgh84m1Di"
    );
    const sbProgramId = SB_ON_DEMAND_PID;
    const sbIdl = await anchor.Program.fetchIdl(sbProgramId, provider);
    const sbProgram = new anchor.Program(sbIdl!, provider);
    const queueAccount = new Queue(sbProgram, sbQueue);

    const coinFlipProgram = new Program(IDL!, coinFlipProgramId, provider);

    const rngKp = Keypair.generate();
    console.log(rngKp.publicKey.toBase58());

    const [randomness, ix] = await Randomness.create(sbProgram, rngKp, sbQueue);

    await pauseForEffect(
      "The Oracle whispers of futures unseen, awaiting our command to cast the die."
    );

    const txRaw = await InstructionUtils.asV0TxWithComputeIxs({
      connection: provider.connection,
      ixs: [ix],
      payer: payer.publicKey,
      signers: [payer, rngKp],
    });
    const sig1 = await provider.connection.sendTransaction(txRaw);
    console.log(sig1);
    await provider.connection.confirmTransaction(sig1);
    console.log("\n✨ Step 2: The Alignment of Celestial Forces ✨");

    // initialise game state
    console.log(
      "As celestial forces align, the stage is set for a quantum leap of fate."
    );
    await pauseForEffect(
      "With every variable in place, the time has come to challenge destiny."
    );

    // Switchboard magic: 2. Commit randomness
    console.log("\n🌌 Step 3: Sealing Fate with The Commitment Ceremony 🌌");
    await pauseForEffect(
      "At this pivotal moment, we invoke the ancient and mysterious powers of Switchboard On-Demand Randomness. With a solemn vow, we commit our guess to the cosmic ledger, never to be altered."
    );

    const transaction1 = new Transaction();
    // Commit transaction
    let commitIx;
    try {
      commitIx = await randomness.commitIx(sbQueue);
    } catch (error) {
      try {
        await queueAccount.fetchFreshOracle();
      } catch (error) {
        console.error(
          "Failed to find an open oracle. Please check our docs to ensure queue ${sbQueue} is an active queue."
        );
        throw error;
      }
      throw error;
    }
    const guess = true;
    // Add your test here.
    const coinFlipIx = await coinFlipProgram.methods
      .coinFlip(randomness.pubkey, guess)
      .accounts({
        playerState: playerStateAccount,
        user: provider.wallet.publicKey,
        randomnessAccountData: randomness.pubkey,
        escrowAccount: escrowAccount,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    // Add the coin flip instruction to
    transaction1.add(commitIx, coinFlipIx);
    const sig2 = await provider.sendAndConfirm(transaction1, [payer]);
    console.log(
      "\n✨ As the cosmic dust settles, our fate is now irrevocably bound to the whims of the universe. The Commitment Ceremony is complete. ✨"
    );
    console.log(`Transaction Signature: ${sig2}`);
    await sleep(5000); // Pause for effect..

    console.log("\n🔮 Step 4: Unveiling Destiny with The Grand Reveal 🔮");
    await pauseForEffect(
      "The air crackles with anticipation. The oracle, now ready, begins the sacred reveal. Watch closely as the curtain between realms thins, offering us a glimpse into the future."
    );

    const transaction2 = new Transaction();
    let revealIx = undefined;
    const settleFlipIx = await coinFlipProgram.methods
      .settleFlip(escrowBump)
      .accounts({
        playerState: playerStateAccount,
        randomnessAccountData: randomness.pubkey,
        escrowAccount: escrowAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const tries = 5;
    for (let i = 0; i < tries; ++i) {
      try {
        revealIx = await randomness.revealIx();
        randomness.serializeIxToFile(
          [revealIx, settleFlipIx],
          "serializedIx.bin"
        );
        break;
      } catch (error) {
        if (i === tries - 1) {
          throw error;
        }
        console.log(
          "Waiting for a tiny bit more for the commitment to be locked..."
        );
        await sleep(1000);
      }
    }

    // Add the settle flip instruction to
    transaction2.add(revealIx!, settleFlipIx);
    const sig = await provider.sendAndConfirm(transaction2, [payer], {
      commitment: COMMITMENT,
    });
    console.log(
      "\n💫 With bated breath, we watched as the oracle unveiled our destiny: 💫"
    );
    console.log(`Transaction Signature: ${sig}`);
    // Dramatic pause
    await sleep(2000);

    let transaction = await connection.getConfirmedTransaction(sig);
    let resultLog = transaction?.meta?.logMessages?.filter((line) =>
      line.includes("FLIP_RESULT")
    )[0];
    let result = resultLog?.split(": ")[2];

    console.log(`\nDestiny reveals itself as... ${result}!`);
  });
});

function fileExists(path: string): boolean {
  try {
    fs.accessSync(path, fs.constants.F_OK);
  } catch {
    return false;
  }
  return true;
}
