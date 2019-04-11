<template>
	<div>
		<h1 class="title">Register</h1>

		<div class="row">
			<div class="col-md-3">

	            <div class="form-group">
	                <label for="description">Name</label>
	                <input class="form-control" placeholder="Enter your name" type="text" v-model="userName">
	            </div>

	            <div class="form-group">
	                <label for="description">Status</label>
	                <input class="form-control" placeholder="Enter your status" type="text" v-model="userStatus">
	            </div>

	            <button class="btn btn-primary" :disabled="disableSubmit" @click="performSubmit">Register</button>
                <strong v-show="submitting">Submitting...</strong>

                <strong  class="text-danger"></strong>

                <div v-show="errorStr" class="alert alert-danger mt-3" role="alert">
                    {{ errorStr }}
                    <br>
                    <small>Check the browser console for more details.</small>
                </div>

                <div v-show="successMessage" class="alert alert-success mt-3" role="alert">
                    <strong>You've been registerd!</strong>
                    <br>
                    You will be redirected to the profile page <strong>once the block will be mined!</strong>
                </div>
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
    			userName: '', // variable binded with the input field: name
    			userStatus: '', // variable binded with the input field: status
                submitting: false, // true once the submit button is pressed
                successMessage: false, // true when the user has been registered successfully

                tmoConn: null, // contain the intervalID given by setInterval
                tmoReg: null, // contain the intervalID given by setInterval
                errorStr: null, // it shows the error message
    		}
    	},

    	computed: {
            /**
             * It disables the submit button when the the name or userStatus are not filled
             * or the submit button is pressed or the connection with the blockchin is
             * not established.
             */
            disableSubmit() {
                return (
                    !this.userName.length ||
                    !this.userStatus.length ||
                    this.submitting ||
                    !this.blockchainIsConnected()
                );
            }
        },

        created() {
            // it checks every 500ms if the user is registered until the connection is established
            this.redirectIfUserRegistered();
        },

        methods: {
            /**
             * Perform the registration of the user when the submit button is pressed.
             *
             * @return {void}
             */
        	performSubmit() {
                this.submitting = true;
                this.errorStr = null;
                this.successMessage = false;

                window.bc.getMainAccount()
                .then(address => this.performUserRegistration(address));
        	},

            /**
             * Show the form error.
             *
             * @param {object} err
             * @return {void}
             */
            showErrorMessage(err) {
                console.error(err);

                this.errorStr = null;

                if (err) this.errorStr = err.toString();

                if (! this.errorStr) this.errorStr = 'Error occurred!';
            },

            /**
             * Perform the user registration cannling the smart contract
             * function registerUser.
             *
             * @param {string} address
             * @return {void}
             */
            performUserRegistration(address) {
                window.bc.contract().registerUser(
                    this.userName,
                    this.userStatus,
                    {
                        from: address,
                        gas: 800000
                    },
                    (err, txHash) => {
                        this.submitting = false;

                        if (err) {
                            this.showErrorMessage(err);
                        }
                        else {
                            this.successMessage = true;

                            // it emits a global event in order to update the top menu bar
                            Event.$emit('userregistered', txHash);

                            // the transaction was submitted and the user will be redirected to the
                            // profile page once the block will be mined
                            this.redirectWhenBlockMined();
                        }
                    }
                )
            },

            /**
             * Check if the user visitng this page is registered: if the user is already
             * registered he will be redirected to the Profile page.
             *
             * @return {void}
             */
            redirectIfUserRegistered() {
                this.tmoConn = setInterval(() => {
                    // checking first the connection
                    if (this.blockchainIsConnected()) {
                        // stopping the interval
                        clearInterval(this.tmoConn);

                        // calling the smart contract
                        this.isRegistered().then(res => {
                            if (res) {
                                // redirecting to the profile page
                                this.$router.push("profile");
                            }
                        });
                    }
                }, 500);
            },

            /**
             * Once the user submitted his registration this funciton checks every 1000 ms
			 * if the registration is successfully. Once the user is registered he will be
			 * redirected to the profile page.
             *
             * NOTE: in order to check if the user has been registered successfully the
             * function has to check several time because the block can take several
             * minutes to be mined (depending on the the blockchain you are using).
             *
             * @return {void}
             */
            redirectWhenBlockMined() {
                this.tmoReg = setInterval(() => {
                    if (this.blockchainIsConnected()) {
                        this.isRegistered()
                        .then(res => {
                            if (res) {
                                // stopping the setInterval
                                clearInterval(this.tmoReg);

								// redirecting the user to the profile page
                                this.$router.push("profile");
                            }
                        })
                        .catch(error => this.showErrorMessage(error));
                    }
                }, 1000);
            }
        }
    }
</script>
