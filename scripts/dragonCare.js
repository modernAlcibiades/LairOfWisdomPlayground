// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { network } = require("hardhat");
const hre = require("hardhat");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // Control parameters
    const TRUST_LIMIT = 1000;
    const SLEEPMS = 3600000;
    let min_trust = TRUST_LIMIT - 1;
    let step = 0;


    // From Lair get all dragons
    const Lair = await ethers.getContractFactory("Lair");
    const lair = await Lair.attach("0x83633dca596e741c80f4fa032c75518cc251b09b");

    // Get list of all dragons and attach contract
    const dragons_list = await lair.allDragons();
    const Dragon = await ethers.getContractFactory("Dragon");

    let dragons = [];
    for (let i = 0; i < dragons_list.length; i++) {
        console.log(dragons_list[i]);
        const dragon = await Dragon.attach(dragons_list[i]);
        const name = await dragon.name();
        dragons.push({
            contract: dragon,
            name: name,
            trust: 0
        });
        console.log("Added ", name, ' at ', i);
    }

    // Load account
    let deployer;
    if (network.name == 'hardhat') {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [process.env.ADDRESS],
        });
        deployer = await ethers.getSigner(process.env.ADDRESS)
    } else if (network.name == 'fantom') {
        deployer = (await ethers.getSigners())[0];
    }

    // Actions that can be performed
    let run = async () => {
        step += 1;
        let minval = TRUST_LIMIT;
        for (let i = 0; i < dragons.length; i++) {
            const dragon = dragons[i].contract;
            let boredom = parseInt(await dragon.getBoredom());
            let hunger = parseInt(await dragon.getHunger());
            let sleepiness = parseInt(await dragon.getSleepiness());
            let uncleanliness = parseInt(await dragon.getUncleanliness());
            const attackTime = parseInt(await dragon.attackCooldown());

            console.log("name, boredom, hunger, sleepiness, uncleanliness, attackTime");
            console.log(dragons[i].name, boredom, hunger, sleepiness, uncleanliness, attackTime);

            // execute script
            if (uncleanliness > 5) {
                console.log("clean");
                const txn = await dragon.clean();
                const receipt = await txn.wait();
                //console.log(receipt);
                uncleanliness = 0;
            }

            // check sleepy
            if (sleepiness > 5 && uncleanliness < 80) {
                console.log("sleep");
                const txn = await dragon.sleep();
                const receipt = await txn.wait();
                //console.log(receipt);
                sleepiness = 0;
                uncleanliness += 5;
            }

            // check hunger
            if (hunger > 5 && boredom < 80 && uncleanliness < 80) {
                console.log("feed");
                const txn = await dragon.feed();
                const receipt = await txn.wait();
                //console.log(receipt);

                hunger = 0;
                boredom += 10;
                uncleanliness += 3;
            }

            // check boredom
            if (boredom > 5 && hunger < 80 && sleepiness < 80 && uncleanliness < 80) {
                console.log("play");
                const txn = await dragon.play();
                const receipt = await txn.wait();
                //console.log(receipt);

                boredom = 0;
                hunger += 10;
                sleepiness += 10;
                uncleanliness += 5;
            }
            console.log("After :", boredom, hunger, sleepiness, uncleanliness);
            // Verify that dragon's trust level is correct for the account
            dragons[i].trust = parseInt(await dragon.trust(deployer.address));
            console.log("Trust : ", dragons[i].name, dragons[i].trust);
            if (dragons[i].trust < minval) {
                minval = dragons[i].trust;
            }
        }
        return minval;
    }
    while (min_trust < TRUST_LIMIT) {
        try {
            min_trust = await run();
            console.log("Lowest trust with dragon : ", min_trust);
            const balance = ethers.utils.formatEther(await deployer.getBalance());
            console.log(deployer.address, balance);
        } catch (e) {
            console.log(e);
        }
        await sleep(SLEEPMS);
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
