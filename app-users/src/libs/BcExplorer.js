/*
 * Copyright 2018 Daniele Favi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// TODO: add function that checks if an address contract is valid

import Web3 from 'web3'

class BcExplorer {

    constructor() {
        this.web3inst = null // store the web3 instace
        this.contractInst = [] // store the smart contract instance

        // general info about connection and user information
        this.info = {
            isConnected: false,
            networkId: 0,
            coinbase: null,
            balance: 0,
            addressUrl: null
        }
    }



    /**
     * Initialize the Web3 instance.
     *
     * @param {string} addressUrl Provider address URL like http://127.0.0.1:7545
     * @return {Promise}
     */
    init(addressUrl) {
        return new Promise((resolve, reject) => {
            // checking if the provider is already set by mist or metamask
            if (typeof web3 !== 'undefined') {
                web3 = new Web3(web3.currentProvider)
            }

            else {
                if (typeof addressUrl == 'undefined') {
                    reject( new Error('BcExplorer error: impossible to connect.') )
                }

                // set the provider you want from Web3.providers
                var provider = new Web3.providers.HttpProvider(addressUrl)

                try {
                    web3 = new Web3(provider)
                }
                catch (e) {
                    // this is in case metamask/mist is off and avoid the exception web3 is not instatiated
                    var web3 = new Web3(provider)
                }
            }

            this.info.addressUrl = addressUrl
            this.info.isConnected = web3.isConnected() // setting the connection
            this.web3inst = web3

            resolve(web3)
        })
    }



    /**
     * Initialize a smart contract from the compiled JSON.
     * The compiledJson parameter is the JSON of the smart contract settings
     * that you can find in the folder /build/contracts/YourContract.json after
     * the migration.
     *
     * @param {Object} compiledJson compiled JSON from truffle
     * @param {string} contractName contract name (required if you are initializing more then one contract)
     * @return {Promise}
     */
    initContractJson(compiledJson, contractName, networkId) {
        var networkId = networkId || null

        // if the networkId is not provided it will find out
        if (! networkId) {
            return this.getNetworkId()
            .then(networkId => {
                return this.performInitContractJson(networkId, compiledJson, contractName)
            })
            .catch(error => {
                return error;
            })
        }

        return this.performInitContractJson(networkId, compiledJson, contractName)
    }



    /**
     * Initialize Web3 and a smart contract.
     * The compiledJson parameter is the JSON of the smart contract settings
     * that you can find in the folder /build/contracts/YourContract.json after
     * the migration.
     *
     * @param {Object} compiledJson
     * @param {string} addressUrl
     * @param {string} contractName contract name (required if you are initializing more then one contract)
     * @return {Promise}
     */
    initWithContractJson(compiledJson, addressUrl, contractName, networkId) {
        return this.init(addressUrl)
        .then(() => {
            return this.initContractJson(compiledJson, contractName, networkId)
        })
    }



    /**
     * Return the info set in the local class variable info.
     *
     * @param {string} attr
     * @return mixed
     */
    getInfo(attr) {
        if (attr) {
            return this.info[attr]
        }

        return this.info
    }



    /**
     * Return the web3 instance.
     * If there is mist/metamask running on the client browser then it will
     * return the global web3 instance. Otherwise it return the local web3 instance.
     *
     * @return {object}
     */
    web3() {
        if (typeof web3 !== 'undefined') return web3

        if (this.web3inst) return this.web3inst

        console.error('BcExplorer error: Web3 is not initialized.')
    }



    /**
     * Check if the connection with the blockchain is established and if the contract
     * is properly initialized.
     *
     * @return {bool}
     */
    isConnected() {
        return this.info.isConnected && this.countContracts()
    }



    /**
     * Return the contract instance.
     *
     * @return {object}
     */
    contract(contractName) {
        if (this.countContracts() == 0) {
            console.error('BcExplorer error: contract is not initialized.')

            return
        }

        var contractName = this.contractDefaultName(contractName)

        if (typeof this.contractInst[contractName] == 'undefined') {
            console.error('BcExplorer error: contract does not exist.')

            return
        }

        return this.contractInst[contractName]
    }



    /**
     * Initialize the smart contract.
     *
     * @param {number} networkId
     * @param {object} compiledJson Truffle compiled JSON after the migration of the smart contract (file you find in /build/contract after smart contract migration)
     * @return boolean
     */
    performInitContractJson(networkId, compiledJson, contractName) {
        if (typeof compiledJson['abi'] == undefined) {
            console.error('BcExplorer error: missing ABI in the compiled Truffle JSON.')
            return false
        }

        var abiArray = compiledJson['abi']

        if ((typeof compiledJson['networks'] == undefined) || (compiledJson['networks'][networkId] == undefined)) {
            console.error('BcExplorer error: missing networkId in the compiled Truffle JSON.')
            return false
        }
        var contractAddr = compiledJson['networks'][networkId].address

        if (!this.web3().isAddress(contractAddr)) return false

        this.initContract(abiArray, contractAddr, contractName)
    }



    /**
     * Initialize the smart contract.
     *
     * @param {object} abiArray ABI of the smart contract
     * @param {string} contractAddr Smart contract address
     * @param {string} contractName contract name (required if you are initializing more then one contract)
     * @return void
     */
    initContract(abiArray, contractAddr, contractName)
    {
        var contractName = this.contractDefaultName(contractName)

        this.contractInst[contractName] = this.web3().eth.contract(abiArray).at(contractAddr)
    }



    /**
     * Return the newtwork ID of the connected blockchain.
     *
     * @return {Promise}
     */
    getNetworkId() {
        return new Promise((resolve, reject) => {
            this.web3().version.getNetwork((error, networkId) => {
                if (error) {
                    console.error(error)
                    reject(new Error('BcExplorer error: networkId not available.'))
                } else {
                    this.info.networkId = networkId

                    resolve(networkId)
                }
            })
        })
    }



    /**
     * Return the address of the current user.
     *
     * @return {Promise}
     */
    getCoinbase() {
        return new Promise((resolve, reject) => {
            this.web3().eth.getCoinbase((error, coinbase) => {
                if (error) {
                   reject(new Error('BcExplorer error: coinbase not available.'))
                } else {
                    this.info.coinbase = coinbase

                    resolve(coinbase)
                }
            })
        })
    }



    /**
     * Return the balance in Wei of the user.
     *
     * @param {string} accountAddr
     * @return {Promise}
     */
    getBalance(accountAddr) {
        return new Promise((resolve, reject) => {
            this.web3().eth.getBalance(accountAddr, (error, balance) => {
                if (error) {
                    reject(new Error('BcExplorer error: impossible to get the balance for the account: ' + accountAddr))
                } else {
                    if (balance && (typeof balance == 'object')) {
                        var bal = balance.toNumber()
                        this.info.balance = bal

                        resolve( bal )
                    }

                    resolve(balance)
                }
            })
        })
    }



    /**
     * Load the generic info (coinbase, networkId and balance of the user).
     *
     * @return {Promise}
     */
    loadInfo() {
        return this.getCoinbase()
        .then(coinbase => {
            return this.getBalance(coinbase)
        })
        .then(balance => {
            return this.getNetworkId()
        })
        .then(networkId => {
            return new Promise((resolve, reject) => {
                resolve(this.info)
            })
        })
    }



    /* ********************************************* */
    /* ************* UTILITY FUNCTIONS ************* */
    /* ********************************************* */

    /**
     * Tranform the balance from Wei to Ether
     *
     * @param {mixed} bal
     * @return {numeric}
     */
    weiToEther(bal) {
        if (typeof bal == 'object') {
            bal = bal.toNumber()
        }

        return this.web3().fromWei(bal, "ether")
    }



    /**
     * Transform the parameter from bytes to string.
     *
     * @param {string} bytes
     * @return {string}
     */
    toAscii(bytes) {
        return this.web3().toAscii(bytes).replace(/\u0000/g, '')
    }



    /**
     * Transform a timestamp number to date.
     *
     * @param {numeric} bytes
     * @return {string}
     */
    toDate(timestamp) {
        return new Date(timestamp * 1000).toISOString()
    }



    /**
     * Count the initialized contracts. Note that array of the initialized
     * contracts is an array key => value.
     *
     * @return {Number}
     */
    countContracts() {
        var total = 0

        for (var key in this.contractInst){
            if (this.contractInst.hasOwnProperty(key)) total++
        }

        return total
    }



    /**
     * Return the string 'default' if the contract name is empty.
     *
     * @return {string} name
     * @return {string}
     */
    contractDefaultName(name) {
        var contractName = name || 'default'

        if (!contractName || !contractName.length) contractName = 'default'

        return contractName
    }


}

export default BcExplorer;
