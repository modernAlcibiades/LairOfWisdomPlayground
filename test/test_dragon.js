const { expect } = require("chai");

describe("Dragon", function () {
  it("Test Dragon contract, get parameters for earning trust", async function () {
    const Dragon = await ethers.getContractFactory("Dragon");
    const dragon = await Dragon.attach("0x6b121793d1cb8936bac7135e8532bfbf3e694166");

    const TRUST_VAL = 0;
    let name = await dragon.name();
    let boredom = parseInt(await dragon.getBoredom());
    let hunger = parseInt(await dragon.getHunger());
    let sleepiness = parseInt(await dragon.getSleepiness());
    let uncleanliness = parseInt(await dragon.getUncleanliness());

    const attackTime = parseInt(await dragon.attackCooldown());

    console.log("name, boredom, hunger, sleepiness, uncleanliness, attackTime");
    console.log(name, boredom, hunger, sleepiness, uncleanliness, attackTime);

    expect(await dragon.canBreed()).to.equal(false);

    // Load account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [process.env.ADDRESS],
    });
    const deployer = await ethers.getSigner(process.env.ADDRESS)
    const balance = ethers.utils.formatEther(await deployer.getBalance());
    console.log(deployer.address, balance);

    // Verify that dragon's trust level is correct for the account
    expect(await dragon.trust(deployer.address)).to.equal(TRUST_VAL);

    // Actions that can be performed
    //check uncleanliness
    if (uncleanliness > 5) {
      console.log("can clean");
    }

    // check sleepy
    if (sleepiness > 5 && uncleanliness < 80) {
      console.log("can sleep");
    }

    // check hunger
    if (hunger > 5 && boredom < 80 && uncleanliness < 80) {
      console.log("can feed");
    }

    // check boredom
    if (boredom > 5 && hunger < 80 && sleepiness < 80 && uncleanliness < 80) {
      console.log("can play");
    }
  });
});
