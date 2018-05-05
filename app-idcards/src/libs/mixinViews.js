import BcExplorer from './BcExplorer'
import IdentityCardsContract from '../assets/IdentityCardsContract.json';

let mixinViews = {
    data() {
        return {
            bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctli initialized
        }
    },

    created() {
        // when this file is imported to other component it checks if the BcExplorer
        // is instatiated.
        if (window.bc == undefined) {
            window.bc = new BcExplorer

            // connecting to the blockchain and intializing the IdentityCards smart contract
            window.bc.initWithContract(IdentityCardsContract, 'http://127.0.0.1:7545')
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
