const { expect } = require("chai");

describe("Lair", function () {
  it("Test LAIR contract, get current dragon, egg addresses", async function () {
    const Lair = await ethers.getContractFactory("Lair");
    const lair = await Lair.attach("0x83633dca596e741c80f4fa032c75518cc251b09b");

    const dragons = await lair.allDragons();
    console.log(dragons);
    expect(dragons.length).to.equal(2);

    const eggs = await lair.allEggs();
    console.log(eggs);
    expect(eggs.length).to.equal(2);

  });
});
