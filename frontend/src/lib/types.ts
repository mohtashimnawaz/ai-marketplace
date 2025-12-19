/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ai_marketplace.json`.
 */
export type AiMarketplace = {
  "address": "8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb",
  "metadata": {
    "name": "aiMarketplace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeMarketplace",
      "docs": [
        "Initialize the marketplace"
      ],
      "discriminator": [
        47,
        81,
        64,
        0,
        96,
        56,
        105,
        7
      ],
      "accounts": [
        {
          "name": "marketplace",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  112,
                  108,
                  97,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "purchaseAccess",
      "docs": [
        "Purchase access to a model (for inference or download)"
      ],
      "discriminator": [
        191,
        249,
        111,
        210,
        163,
        248,
        87,
        242
      ],
      "accounts": [
        {
          "name": "access",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "model"
              }
            ]
          }
        },
        {
          "name": "model",
          "writable": true
        },
        {
          "name": "marketplace",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  112,
                  108,
                  97,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "optional": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true,
          "optional": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true,
          "optional": true
        },
        {
          "name": "tokenProgram",
          "optional": true,
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "accessType",
          "type": {
            "defined": {
              "name": "accessType"
            }
          }
        },
        {
          "name": "durationDays",
          "type": {
            "option": "u32"
          }
        }
      ]
    },
    {
      "name": "recordDownload",
      "docs": [
        "Record a model download"
      ],
      "discriminator": [
        24,
        136,
        98,
        27,
        75,
        101,
        197,
        76
      ],
      "accounts": [
        {
          "name": "access",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "model"
              }
            ]
          }
        },
        {
          "name": "model",
          "writable": true
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "recordInference",
      "docs": [
        "Record an inference execution"
      ],
      "discriminator": [
        78,
        248,
        164,
        52,
        223,
        207,
        215,
        252
      ],
      "accounts": [
        {
          "name": "usage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  97,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "model"
              },
              {
                "kind": "arg",
                "path": "inferenceHash"
              }
            ]
          }
        },
        {
          "name": "access",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  99,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "model"
              }
            ]
          }
        },
        {
          "name": "model",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "inferenceHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerModel",
      "docs": [
        "Register a new AI model"
      ],
      "discriminator": [
        111,
        236,
        93,
        31,
        195,
        210,
        142,
        125
      ],
      "accounts": [
        {
          "name": "model",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  100,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "marketplace.total_models",
                "account": "marketplace"
              }
            ]
          }
        },
        {
          "name": "marketplace",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  112,
                  108,
                  97,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "modelHash",
          "type": "string"
        },
        {
          "name": "storageUri",
          "type": "string"
        },
        {
          "name": "modelSize",
          "type": "u64"
        },
        {
          "name": "inferencePrice",
          "type": "u64"
        },
        {
          "name": "downloadPrice",
          "type": "u64"
        },
        {
          "name": "paymentToken",
          "type": {
            "defined": {
              "name": "paymentToken"
            }
          }
        }
      ]
    },
    {
      "name": "updateModelPricing",
      "docs": [
        "Update model pricing"
      ],
      "discriminator": [
        112,
        202,
        130,
        250,
        160,
        61,
        253,
        112
      ],
      "accounts": [
        {
          "name": "model",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  100,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "model.model_id",
                "account": "model"
              }
            ]
          }
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "model"
          ]
        }
      ],
      "args": [
        {
          "name": "inferencePrice",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "downloadPrice",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "updateModelStatus",
      "docs": [
        "Update model status"
      ],
      "discriminator": [
        234,
        110,
        41,
        94,
        236,
        250,
        247,
        185
      ],
      "accounts": [
        {
          "name": "model",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  100,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "model.model_id",
                "account": "model"
              }
            ]
          }
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "model"
          ]
        }
      ],
      "args": [
        {
          "name": "isActive",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdrawEarnings",
      "docs": [
        "Withdraw creator earnings"
      ],
      "discriminator": [
        6,
        132,
        233,
        254,
        241,
        87,
        247,
        185
      ],
      "accounts": [
        {
          "name": "model",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  100,
                  101,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "model.model_id",
                "account": "model"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "model"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "access",
      "discriminator": [
        117,
        154,
        108,
        210,
        202,
        83,
        96,
        222
      ]
    },
    {
      "name": "marketplace",
      "discriminator": [
        70,
        222,
        41,
        62,
        78,
        3,
        32,
        174
      ]
    },
    {
      "name": "model",
      "discriminator": [
        152,
        221,
        247,
        122,
        185,
        125,
        223,
        151
      ]
    },
    {
      "name": "usage",
      "discriminator": [
        152,
        162,
        178,
        106,
        43,
        208,
        237,
        89
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Model name is too long (max 100 characters)"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description is too long (max 500 characters)"
    },
    {
      "code": 6002,
      "name": "hashTooLong",
      "msg": "Hash is too long (max 64 characters)"
    },
    {
      "code": 6003,
      "name": "uriTooLong",
      "msg": "URI is too long (max 200 characters)"
    },
    {
      "code": 6004,
      "name": "modelInactive",
      "msg": "Model is not active"
    },
    {
      "code": 6005,
      "name": "accessExpired",
      "msg": "Access has expired"
    },
    {
      "code": 6006,
      "name": "invalidAccessType",
      "msg": "Invalid access type for this operation"
    },
    {
      "code": 6007,
      "name": "invalidDuration",
      "msg": "Invalid duration for subscription"
    }
  ],
  "types": [
    {
      "name": "access",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "model",
            "type": "pubkey"
          },
          {
            "name": "accessType",
            "type": {
              "defined": {
                "name": "accessType"
              }
            }
          },
          {
            "name": "purchasedAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "inferenceCount",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "accessType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "inference"
          },
          {
            "name": "download"
          },
          {
            "name": "subscription"
          }
        ]
      }
    },
    {
      "name": "marketplace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u64"
          },
          {
            "name": "totalModels",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "model",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "modelHash",
            "type": "string"
          },
          {
            "name": "storageUri",
            "type": "string"
          },
          {
            "name": "modelSize",
            "type": "u64"
          },
          {
            "name": "inferencePrice",
            "type": "u64"
          },
          {
            "name": "downloadPrice",
            "type": "u64"
          },
          {
            "name": "paymentToken",
            "type": {
              "defined": {
                "name": "paymentToken"
              }
            }
          },
          {
            "name": "totalInferences",
            "type": "u64"
          },
          {
            "name": "totalDownloads",
            "type": "u64"
          },
          {
            "name": "totalRevenue",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "modelId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "paymentToken",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sol"
          },
          {
            "name": "splToken"
          }
        ]
      }
    },
    {
      "name": "usage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "model",
            "type": "pubkey"
          },
          {
            "name": "inferenceHash",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
