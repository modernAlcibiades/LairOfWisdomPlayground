const { expect } = require("chai");

describe("Lair", function () {
  it("Test LAIR contract, get current dragon, egg addresses", async function () {
    const Egg = await ethers.getContractFactory("Egg");
    const egg = await Egg.attach("0xbde7bdcf886a7bf769b3e92b405013bd1969e840");

    // Make egg tests

  });
});
