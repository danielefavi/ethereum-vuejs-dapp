# Ethereum and VueJS DApp
**Build your decentralized application with Ethereum blockchain and Vue JS**

This is a simple decentralized application built using **Ethereum** blockchain and **Vue JS** for the front-end. This DApp example let the users store their name and their identity card number on the blockchain. 

![N|Solid](https://www.danielefavi.com/wp-content/uploads/2018/05/ethereum_vue_dapp_idcards_list.png)

# Brief description
The DApp allow users to register their identity cards (owner name and card number) in the blockchain. The user’s identity card is associated with an account address.

The owner of the identity card is the only one that can modify its own data. This will give you a technical explanation of what it means when the user is on control of its own data (just like Facebook… sarcasm!).
The **smart contract** is designed to give to the user the **control of his own data** and not even the creator of the smart contract can edit someone else data. 

# Prerequisite
- NPM version 5.8.0
- TRUFFLE verson 4.1.5
- Ganache or your private network
- Metamask: not mandatory but better if you want to insert more than one card

# Quick Installation
1) Download the project and decompress it into the folder **~/ethereumVue** (or wherever you want).
2) Start ganache (or your private blockchain).
3) Open the terminal (if you are using Windows you **must use the Power Shell**) in the folder **~/ethereumVue** and run the command:
```sh
$ truffle console --network ganache
```
4) If ganache is running you should be inside the truffle console; now run the following command in the truffle console:
```sh
$ migrate --reset --compile-all
```
5) If the migration was successful, copy the content of the file **~/ethereumVue/build/contracts/IdentityCards.json** into **~/ethereumVue/app-idcards/src/assets/IdentityCardsContract.json**
6) Open another terminal in the folder ~/ethereumVue/app-idcard and run the command:
```sh
$ npm install
```
7) Once all the dependencies are installed run the command:
```sh
$ npm run dev
```
If everything went fine you should see this message:
```sh
Your application is running here: http://localhost:8081
```
8) Open the browser and go to http://localhost:8081 to test the DApp!

**NOTE:** if you want to try to add more cards you have to install metamask in your browser, then import the accounts into metamask and finally change account on metamask in order to register new identity cards. 

Visit [DanieleFavi.com](https://www.danielefavi.com/) for more info.