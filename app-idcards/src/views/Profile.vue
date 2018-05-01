<template>
    <div>
        <h1 class="title">Profile</h1>


        <div class="row">
            <div class="col-md-3">
                <h3>Update your ID card</h3><hr>

                <h4>
                    Card ID: {{ cardId }}    
                </h4>

                <div class="form-group">
                    <label for="description">Name</label>
                    <input class="form-control" id="name" placeholder="Enter name" type="text" name="name" v-model="name">
                </div>

                <div class="form-group">
                    <label for="description">Card Number</label>
                    <input class="form-control" id="card-numner" placeholder="Enter your card number" type="text" name="card-number" v-model="cardNumber">
                </div>

                <button class="btn btn-primary" :disabled="disableSubmit" @click="performSubmit">Save</button>
                <strong v-show="submitting">Submitting...</strong>
                <strong v-show="errorSubmit" class="text-danger">Error occurred!</strong>
                <strong v-show="successSave" class="text-success">Tx submitted!</strong>
            </div>

            <div class="col-md-3">
                <h3>Info</h3><hr>

                <p>
                    <strong>Address</strong>: {{ coinbase }}
                </p>
                <p>
                    <strong>Balance</strong>: {{ balance }} ETH
                </p>
            </div>
        </div>

    </div>
</template>

<script>
    // importing common function
    import mixin from '../libs/mixinViews';


    /**
     * Profile view component: this component shows the user profile.
     * In this page the user can update his own identity card only and
     * view other details like his wallet address and balance.
     */
    export default {
        mixins: [mixin],

        data() {
            return {
                name: '', // variable binded with the name's input field
                cardNumber: '', // varialbe binded to the card-number's input filed
                cardId: 0, // card number ID of the user

                coinbase: '0x0', // address of the user
                balance: 0, // balance of the user

                tmoConn: null, // contain the intervalID given by setInterval

                submitting: false, // true when the submit is pressed
                successSave: false, // it show the success message
                errorSubmit: false, // it shows the erro message
            }
        },

        computed: {
            /**
             * It disables the submit button when the the name or cardNumber are not filled
             * or the submit button is pressed or the connection with the blockchin is
             * not established.
             */
            disableSubmit() {
                return (!this.name.length || !this.cardNumber.length || this.submitting || !this.blockchainIsConnected())
            }
        },

        methods: {

            /**
             * Get the identity card of the current user.
             * This methos calls the function getOwnCard from the smart contract
             * and it returns the identity card where:
             *      card[0] => uint     card ID
             *      card[1] => string   card owner name
             *      card[2] => bytes32  card number
             */
            getPersonalCard() {
                window.bc.contract().getOwnCard((error, card) => {
                    this.cardId = card[0].toNumber()
                    this.name = card[1]
                    // card[2] is bytes32 format so it has to be trasformed to stirng
                    this.cardNumber = this.toAscii(card[2])
                })
            },

            /**
             * Updates the user's identity card when the button is pressed.
             */
            performSubmit() {
                this.submitting = true
                this.errorSubmit = false;
                this.successSave = false;

                // calling the method updateCard from the smart contract
                window.bc.contract().updateCard(
                    this.name,
                    this.cardNumber,
                    {
                        from: window.bc.web3().eth.coinbase,
                        gas: 800000
                    },
                    (err, txHash) => {
                        this.handleSubmitResult(err, txHash)
                    }
                )
            },

            /**
             * Handle the result of the response of updateCard.
             */
            handleSubmitResult(err, txHash) {
                this.submitting = false
                if (err) {
                    console.error(err)
                    this.errorSubmit = true;
                }
                else if (txHash) {
                    this.errorSubmit = false;
                    this.successSave = true;
                }
            },

            /**
             * It loads the general info (address and balance of the user).
             */
            getInfoBc() {
                window.bc.loadInfo().then(info => {
                    this.coinbase = info.coinbase
                    this.balance = this.weiToEther( info.balance )
                })
            },

            /**
             * It loads the user information once connected to the blockchian
             */
            checkConnectionAndLoad() {
                if (this.blockchainIsConnected()) {
                    // stopping the interval
                    clearInterval(this.tmoConn)

                    this.loadEverything()
                }
            },

            /**
             * Load the user's info: identity card and general info
             */
            loadEverything() {
                // checking if the user is registered
                window.bc.contract().isRegistered.call((error, res) => {
                    if (error) {
                        console.error(error)
                        this.$router.push("register")
                    }
                    // if the user is registered it will load the profile page
                    else if (res) {
                        this.getPersonalCard()
                        this.getInfoBc()
                    }

                    // if the user not registered the user will be redirected to the Register page
                    // TODO: remember to restore here
                    else this.$router.push("register")
                })
            }
        },

        created() {
            // it will call the function checkConnectionAndLoad every 500ms
            // until the connection to the blockchain is enstablished
            this.tmoConn = setInterval(() => {
                this.checkConnectionAndLoad()
            }, 500)
        }
    }
</script>
