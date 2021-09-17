# Dragon Priest
Project provides javascript scripts to take care of Dragons while earning their trust. Checkout `scripts/dragonCare.js` for
the code. This way you can earn trust on your wallet.

The script gets all the existing dragons, and proceeds to feed, play, clean, and sleep all the Dragons, one by one. In addition, there are heuristics to heal, upgrade and breed.
## How To Use
To setup the project, open the terminal and do the following
```
git clone https://github.com/modernAlcibiades/LairOfWisdomPlayground.git
cd LairOfWisdomPlayground
touch .env
```

The .env file contains your local scripts, edit it to include the following structure. 
NOTE - DO NOT share the .env file for your own safety.
```
RPC_URL=https://rpc.ftm.tools/
PRIVATE_KEY=<your private key>
ADDRESS=<account address>
```

You will need to have npm installed.
To run caretaker job that takes care of all dragons, do the following
```
cd LairOfWisdomPlayground
npx hardhat run scripts/dragonCare.js --network fantom
```

Running the caretaker once every few hours is more than enough. Once a day would also be fine. Dragons are strong!
You can also set the preferred name for your dragon in the file.

## Configuration
Edit `config.js` file to control the parts of the code that get run
- To take care of all the dragons, set `CHOOSE_DRAGONS=all`
- If you want to select particular dragons, add their contract address to the array. 
  For example, to choose Leshner and Pleasr, set
  ```js
   CHOOSE_DRAGONS: [
     '0x6b121793d1cB8936BAC7135e8532BfBf3e694166',
     '0xF10E6c070DEa8af8Cc5dd19bAAB732D9Ab4Ba869'
   ],
  ```
- Set `RUN_BASIC=true` if you want to call tasks that earn trust : `play, sleep, feed, clean`
- Set `RUN_ADVANCED=true` if you want to call tasks that use trust : `heal, upgrade, breed`


## About
This is a hobby project interacts with contracts that are part of the Lair of Wisdom.
Lair Address `0x83633dca596e741c80f4fa032c75518cc251b09b`

## Goals
- Basic caretaker job to maintain the dragons
- Regular tributes to eggs

## Note
- Dragons with boredom >80, hunger>80 cannot be fed or played with. There is no
  way to reduce the hunger and boredom values at that point.
- Do not worry if you see occasional error message due to Underpriced transactions. It shouldn't affect the overall functioning.
- Sleep timer added to allow for correct nonce. May need to be changed depending on network conditions.

## TO DO
- Proxy smart contract to replace the script while ensuring caller earns the trust.
- Improve heuristics for the advanced scripts.
- Add configurable parameters to a dummy .env file for reference.

If you wish to support the project, add issues on Github, or fork the project.
If you wish to support me, send some love to `0x252DD902190Be0b9aCac625996fDa7137A4b684c`

Peace!!