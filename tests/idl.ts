import { Idl } from "@project-serum/anchor";

export const IDL: Idl = {
    "version": "0.1.0",
    "name": "switchboard_generate_number",
    "instructions": [
      {
        "name": "initialize",
        "accounts": [
          {
            "name": "playerState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "coinFlip",
        "accounts": [
          {
            "name": "playerState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "randomnessAccountData",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "escrowAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "randomnessAccount",
            "type": "publicKey"
          },
          {
            "name": "guess",
            "type": "bool"
          }
        ]
      },
      {
        "name": "settleFlip",
        "accounts": [
          {
            "name": "playerState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "randomnessAccountData",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "escrowAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "escrowBump",
            "type": "u8"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "PlayerState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "allowedUser",
              "type": "publicKey"
            },
            {
              "name": "latestFlipResult",
              "type": "bool"
            },
            {
              "name": "randomnessAccount",
              "type": "publicKey"
            },
            {
              "name": "currentGuess",
              "type": "bool"
            },
            {
              "name": "wager",
              "type": "u64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "Unauthorized",
        "msg": "Unauthorized access attempt."
      },
      {
        "code": 6001,
        "name": "GameStillActive"
      },
      {
        "code": 6002,
        "name": "NotEnoughFundsToPlay"
      },
      {
        "code": 6003,
        "name": "RandomnessAlreadyRevealed"
      },
      {
        "code": 6004,
        "name": "RandomnessNotResolved"
      }
    ],
    "metadata": {
      "address": "5p3k3TUCfwYof4HLVsjDgLcWv21YxkPccHMJCXX4AEA2"
    }
  }

export const SyphonTokenLockIDl: Idl = {
  version: "0.1.0",
  name: "pump_game",
  instructions: [
    {
      name: "createGlobalAta",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "globalLockedTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "programSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "lockTokens",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lockingAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalLockedTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "lockType",
          type: "string",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "unlockTokens",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lockingAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalLockedTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "programSigner",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "lockType",
          type: "string",
        },
      ],
    },
    {
      name: "adminWithdrawTokens",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "adminTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalLockedTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "programSigner",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "LockingAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "startTime",
            type: "u64",
          },
          {
            name: "endTime",
            type: "u64",
          },
          {
            name: "rewardMultiplier",
            type: "f64",
          },
          {
            name: "lockType",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidLockType",
      msg: "Invalid lock type.",
    },
    {
      code: 6001,
      name: "LockPeriodNotOver",
      msg: "Lock period is not over.",
    },
  ],
  metadata: {
    address: "AGAtML592JZnHBjDDEZ97DGNy9jwETaPiAxtrBfcXFaX",
  },
};
