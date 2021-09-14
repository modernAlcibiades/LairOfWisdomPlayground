require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
*/

module.exports = {
  solidity: "0.8.6",
  networks: {
    hardhat: {
      forking: {
        chainId: 250,
        url: "https://rpc.ftm.tools/",
        blockNumber: 17052645,
        accounts: [process.env.PRIVATE_KEY]
      }
    },
    fantom: {
      chainId: 250,
      url: "https://rpc.ftm.tools/",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 130000000000
    },
  },
  "evmVersion": "berlin",
  "libraries": {},
  "metadata": {
    "bytecodeHash": "ipfs",
    "useLiteralContent": true
  },
  "optimizer": {
    "enabled": true,
    "runs": 200
  },
  "remappings": [],
  "outputSelection": {
    "*": {
      "*": [
        "evm.bytecode",
        "evm.deployedBytecode",
        "abi"
      ]
    }
  }
};

