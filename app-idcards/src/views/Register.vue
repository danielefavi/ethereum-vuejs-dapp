<template>
	<div>
		<h1 class="title">Register</h1>

		<div class="row">
			<div class="col-md-3">

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

                <p v-show="successMessage" class="text-success">
                    Your card has been registerd.
                    <br>
                    You will be redirected to the profile page <strong>once the block will be mined!</strong>
                </p>
			</div>
		</div>
	</div>
</template>

<script>
    // importing common function
    import mixin from '../libs/mixinViews';

    export default {
        mixins: [mixin],

    	data() {
    		return {
    			name: '', // variable binded with the input field: name
    			cardNumber: '', // variable binded with the input field: card number 
                submitting: false, // true once the submit button is pressed
                successMessage: false, // true when the user has been registered successfully

                tmoConn: null, // contain the intervalID given by setInterval
                tmoReg: null, // contain the intervalID given by setInterval
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
             * Perform the registration of the user when the submit button is pressed.
             */
        	performSubmit() {
                this.submitting = true
                this.errorSubmit = false
                this.successMessage = false

                // calling the function registerUser of the smart contract
                window.bc.contract().registerUser(
                    this.name,
                    this.cardNumber,
                    {
                        from: window.bc.web3().eth.coinbase,
                        gas: 800000
                    },
                    (err, txHash) => {
                        if (err) {
                            console.error(err)
                            this.errorSubmit = true
                        }
                        else {
                            this.successMessage = true

                            // it emits a global event in order to update the top menu bar
                            Event.$emit('cardregistered', txHash);

                            // the transaction was submitted and the user will be redirected to the
                            // profile page once the block will be mined
                            this.redirectWhenBlockMined()
                        }
                    }
                )
        	},

            /**
             * Check if the user visitng this page is registered: if the user is already
             * registered he will be redirected to the Profile page.
             */
            redirectIfUserRegistered() {
                this.tmoConn = setInterval(() => {
                    // checking first the connection
                    if (this.blockchainIsConnected()) {
                        // stopping the interval
                        clearInterval(this.tmoConn)

                        // calling the smart contract
                        window.bc.contract().isRegistered.call((error, res) => {
                            if (res) {
                                // redirecting to the profile page
                                this.$router.push("profile")
                            }
                        })
                    }
                }, 500)
            },

            /**
             * Check if the user is registered calling the function of the smart contract isRegistered.
             * This function is used when the user registers his own identity card.
             * The difference with the previous function is:
             *      - the function redirectIfUserRegistered stop checking when the card has been registered
             *        once the connection with the blockchain is established.
             *      - the function redirectWhenBlockMined stop checking when the card has been
             *        registered.
             * 
             * NOTE: in order to check if the user has been registered successfully the function has to check
             * several time because the block can take several minutes in order to be mined (depending on the
             * configuration of the blockchain you are using).
             */
            redirectWhenBlockMined() {
                this.tmoReg = setInterval(() => {
                    if (this.blockchainIsConnected()) {
                        window.bc.contract().isRegistered.call((error, res) => {
                            if (error) {
                                console.error(error)
                            }
                            else if (res) {
                                // stopping the setInterval
                                clearInterval(this.tmoReg)

                                this.$router.push("profile")
                            }
                        })
                    }
                }, 1000)
            }
        },

        created() {
            // it checks every 500ms if the user is registered until the connection is established
            this.redirectIfUserRegistered()
        }
    }
</script>
