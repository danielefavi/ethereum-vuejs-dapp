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
     * Initialize a contract.
     * The settings parameter is the JSON of the smart contract settings that you can find in the
     * folder /build/contracts/YourContract.json after the migration.
     *
     * @param {Object} settings
     * @param {string} contractName
     * @return {Promise}
     */
    initContract(settings, contractName) {
        var contractName = this.contractDefaultName(contractName)

        return this.getNetworkId()
        .then(networkId => {
            return this.initContractJson(networkId, settings, contractName)
        })
    }



    /**
     * Initialize web3 plus the contract.
     * The settings parameter is the JSON of the smart contract settings that you can find in the
     * folder /build/contracts/YourContract.json after the migration.
     *
     * @param {Object} settings
     * @param {string} addressUrl
     * @param {string} contractName
     * @return {Promise}
     */
    initWithContract(settings, addressUrl, contractName) {
        return this.init(addressUrl)
        .then(() => {
            return this.initContract(settings, contractName)
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
     * @param {object} settings Compiled JSON after the migration of the smart contract (file you find in /build/contract after smart contract migration)
     * @return void
     */
    initContractJson(networkId, settings, contractName) {
        if (typeof settings['abi'] == undefined) {
            console.error('BcExplorer error: missing ABI in settings.')
            return
        }

        var abiArray = settings['abi']

        if ((typeof settings['networks'] == undefined) || (settings['networks'][networkId] == undefined)) {
            console.error('BcExplorer error: missing networkId in settings.')
            return
        }

        var contractAddr = settings['networks'][networkId].address

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

    /* ********************************************* */
    /* ********************************************* */
    /* ********************************************* */


    /**
     * Get all identity cards.
     *
     * @param {function} callback
     * @return void
     */
    getAllCards(callback) {
        if (! this.isConnected()) {
            console.error('BcExplorer error: not connected.')
            return;
        }

        // getting the total number of the identity cards stored in the blockchain
        // calling the method totalIdCards from the smart contract
        this.contract().totalIdCards.call((err, total) => {
            var tot = 0
            if (total) tot = total.toNumber()

            if (tot > 0) {
                // getting the card one by one
                for (var i=1; i<tot; i++) {

                    this.contract().getCardById.call(i, (error, card) => {
                        callback(card)
                    })

                } // end for
            } // end if

        }) // end totalIdCards call
    }
}


export default BcExplorer;
