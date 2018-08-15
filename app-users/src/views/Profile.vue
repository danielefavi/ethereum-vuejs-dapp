<template>
    <div>
        <h1 class="title">Profile</h1>


        <div class="row">
            <div class="col-md-3">
                <h3>Update your Profile</h3><hr>

                <h4>
                    Your ID: {{ userId }}
                </h4>

                <div class="form-group">
                    <label for="description">Name</label>
                    <input class="form-control" placeholder="Enter your name" type="text" v-model="userName">
                </div>

                <div class="form-group">
                    <label for="description">Status</label>
                    <input class="form-control" placeholder="Update your status" type="text" v-model="userStatus">
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
     * In this page the user can update his own profile and he can
     * view other details like his wallet address and balance.
     */
    export default {
        mixins: [mixin],

        data() {
            return {
                userName: '', // variable binded with the name's input field
                userStatus: '', // varialbe binded to the status's input filed
                userId: 0, // user ID from the blockchain

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
             * It disables the submit button when the the userName or userStatus are not filled
             * or the submit button is pressed or the connection with the blockchin is
             * not established.
             */
            disableSubmit() {
                return (!this.userName.length || !this.userStatus.length || this.submitting || !this.blockchainIsConnected())
            }
        },

        methods: {

            /**
             * Get the profile details of the user.
             * This methos calls the smart contract function getOwnProfile
             * and it returns the user details where:
             *      userDet[0] => uint     user ID
             *      userDet[1] => string   user's name
             *      userDet[2] => bytes32  user's status
             */
            getProfile() {
                window.bc.contract().getOwnProfile((error, userDet) => {
                    this.userId = userDet[0].toNumber()
                    this.userName = userDet[1]
                    // userDet[2] is bytes32 format so it has to be trasformed to stirng
                    this.userStatus = this.toAscii(userDet[2])
                })
            },

            /**
             * Updates the user's details when the button is pressed.
             */
            performSubmit() {
                this.submitting = true
                this.errorSubmit = false;
                this.successSave = false;

                // calling the method updateUser from the smart contract
                window.bc.contract().updateUser(
                    this.userName,
                    this.userStatus,
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
             * Handle the result of the response of updateUser.
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
                    this.balance = window.bc.weiToEther( info.balance )
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
             * Load the user's info: user name, status and general info
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
                        this.getProfile()
                        this.getInfoBc()
                    }

                    // if the user not registered the user will be redirected to the Register page
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
