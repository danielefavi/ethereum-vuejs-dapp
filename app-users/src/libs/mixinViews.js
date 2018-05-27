import BcExplorer from './BcExplorer'
import UsersContract from '../assets/UsersContract.json';

let mixinViews = {
    data() {
        return {
            bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctli initialized
            bcConnectionError: false,
            bcSmartContractAddressError: false
        }
    },

    created() {
        // when this file is imported to other component it checks if the BcExplorer
        // is instatiated.
        if (window.bc == undefined) {
            window.bc = new BcExplorer

            // connecting to the blockchain and intializing the Users smart contract
            window.bc.initWithContractJson(UsersContract, 'http://127.0.0.1:7545')
            .then((error) => {
                // handling the connection error
                if (error) {
                    this.bcConnectionError = true
                    this.bcConnected = false
                    console.log(error)
                }
                else {
                    // calling a smart contract function in order to check the contract address
                    // is correct. NOTE: here you might be connected successfully.
                    // TODO: the check of the smart contract address validity it should be BcExplorer duty
                    window.bc.contract().isRegistered.call((errorReg, res) => {
                        if (errorReg) {
                            this.bcConnectionError = true
                            this.bcSmartContractAddressError = true
                            console.log(errorReg)
                        }
                        else {
                            this.bcConnectionError = false
                        }

                        this.bcConnected = this.blockchainIsConnected()
                    })
                }
            })
        }
    },

    methods: {
        /**
         * Check if the connection with the blockchain is established and if the smart
         * contract ABI + address are correctly initialized.
         */
        blockchainIsConnected() {
            this.bcConnected = ((window.bc != undefined) && window.bc.isConnected())

            return this.bcConnected
        },

        /**
         * Transform the parameter from bytes to string.
         */
        toAscii(bytesStr) {
            return window.bc.toAscii(bytesStr)
        },

        /**
         * Transform a timestamp number to date.
         */
        toDate(timestamp) {
            return new Date(timestamp * 1000).toISOString()
        }
    }
}


export default mixinViews
