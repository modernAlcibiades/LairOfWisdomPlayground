const { expect } = require("chai");

describe("Account", function () {
  it("Test that account works with ftm mainnet", async function () {
    // Load account dependant on the chain
    let deployer;
    if (network.name == 'hardhat') {
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [process.env.ADDRESS],
      });
      deployer = await ethers.getSigner(process.env.ADDRESS)
    } else if (network.name == 'fantom') {
      deployer = (await ethers.getSigners())[0];
      console.log(deployer);
    }
    const balance = ethers.utils.formatEther(await deployer.getBalance());
    console.log(deployer.address, balance);
    expect(deployer.address).to.equal(process.env.ADDRESS);
  });
});
