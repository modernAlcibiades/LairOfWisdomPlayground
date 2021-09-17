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
    const ADVANCED_TRUST_THRESH = 50;
    const SLEEPMS = 1000;
    let min_trust = TRUST_LIMIT - 1;
    let step = 0;

    const names = ['Anomander Rake', 'cthae', 'Bitcoin', 'Fantom'];
    let name_index = 0;

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
        const maxHealth = await dragon.maxHealth();
        dragons.push({
            contract: dragon,
            address: dragons_list[i],
            name: name,
            maxHealth: maxHealth,
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
        for (let i = 0; i < dragons.length; i++) {
            try {
                const dragon = dragons[i].contract;
                let boredom = parseInt(await dragon.getBoredom());
                let hunger = parseInt(await dragon.getHunger());
                let sleepiness = parseInt(await dragon.getSleepiness());
                let uncleanliness = parseInt(await dragon.getUncleanliness());
                const attackTime = parseInt(await dragon.attackCooldown());

                console.log("name, boredom, hunger, sleepiness, uncleanliness, attackTime");
                console.log(dragons[i].name, boredom, hunger, sleepiness, uncleanliness, attackTime);

                // check boredom
                if (boredom > 5 && hunger < 80 && sleepiness < 80 && uncleanliness < 80) {
                    console.log("play");
                    const txn = await dragon.play();
                    const receipt = await txn.wait();
                    //console.log(receipt);
                    sleep(SLEEPMS);

                    boredom = 0;
                    hunger += 10;
                    sleepiness += 10;
                    uncleanliness += 5;
                }

                // check hunger
                if (hunger > 5 && boredom < 80 && uncleanliness < 80) {
                    console.log("feed");
                    const txn = await dragon.feed();
                    const receipt = await txn.wait();
                    //console.log(receipt);
                    sleep(SLEEPMS);

                    hunger = 0;
                    boredom += 10;
                    uncleanliness += 3;
                }

                // check sleepy
                if (sleepiness > 5 && uncleanliness < 80) {
                    console.log("sleep");
                    const txn = await dragon.sleep();
                    const receipt = await txn.wait();
                    sleep(SLEEPMS);
                    //console.log(receipt);
                    sleepiness = 0;
                    uncleanliness += 5;
                }

                // execute script
                if (uncleanliness > 5) {
                    console.log("clean");
                    const txn = await dragon.clean();
                    const receipt = await txn.wait();
                    //console.log(receipt);
                    sleep(SLEEPMS);
                    uncleanliness = 0;

                }

                console.log("After :", boredom, hunger, sleepiness, uncleanliness);
                // Verify that dragon's trust level is correct for the account
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    let runAdvanced = async () => {
        // Advanced actions : Heal, Upgrade, Breed
        // Only do these sparingly when trust level is high
        let breedable = [];
        let minval = TRUST_LIMIT;
        for (let i = 0; i < dragons.length; i++) {
            try {
                const dragon = dragons[i].contract;

                // Check trust level
                const trust = parseInt(await dragon.trust(deployer.address));
                dragons[i].trust = trust;
                console.log("Trust : ", dragons[i].name, trust);
                if (trust < minval) {
                    minval = trust;
                }

                // Check if needs healing
                const health = parseInt(await dragon.health());
                if (health < 0.8 * dragons[i].maxHealth) {
                    dragon.heal();
                    console.log("Healing", dragons[i].name, health);
                    sleep(SLEEPMS);
                }

                // Check if can be upgraded
                const whenUpgrade = parseInt(await dragon.secondsUntilUpgrade());
                console.log(whenUpgrade);
                if (whenUpgrade == 0 && trust > 10) {
                    if (i % 4 == 0) {
                        await dragon.upgradeAttackCooldown();
                        console.log("Upgrade Attack Cooldown", dragons[i].name);
                    } else if (i % 4 == 1) {
                        await dragon.upgradeDamage();
                        console.log("Upgrade Damage", dragons[i].name);
                    } else if (i % 4 == 2) {
                        await dragon.upgradeHealing();
                        console.log("Upgrade Healing", dragons[i].name);
                    } else if (i % 4 == 3) {
                        await dragon.upgradeMaxHealth();
                        console.log("Upgrade Max Health", dragons[i].name);
                    }
                    sleep(SLEEPMS);
                }

                // Check if can breed
                const canBreed = await dragon.canBreed();
                if (canBreed) {
                    breedable.push(dragons[i]);
                    console.log(dragons[i].name, "can breed");
                } else {
                    console.log(dragons[i].name, "wait for breeding", parseInt(await dragon.secondsUntilBreed()));
                }
            } catch (e) {
                console.log(e);
            }
        }
        if (minval > 50 && breedable.length > 1) {
            for (let i = 0; i < breedable.length - 1; i += 2) {
                const txn = await breedable[i].contract.breed(breedable[i + 1].contract, names[name_index]);
                const receipt = await txn.wait();
                console.log("Breeding", breedable[i].name, breedable[i + 1].name);
                names_index++;
                sleep(SLEEPMS);
            }
        }

        return minval;
    }
    let balance = ethers.utils.formatEther(await deployer.getBalance());
    if (min_trust < TRUST_LIMIT) {
        await run();
        min_trust = await runAdvanced();
        console.log("Lowest trust with dragon : ", min_trust);
        balance = ethers.utils.formatEther(await deployer.getBalance());
        console.log("Caller", deployer.address, "Balance in FTM", balance);
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
