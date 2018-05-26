<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <ul class="navbar-nav">
            <router-link tag="li" class="nav-link" to="/" exact>
                <a>Statuses</a>
            </router-link>

            <router-link tag="li" class="nav-link" to="/profile" exact v-show="userIsRegistered">
                <a>Profile</a>
            </router-link>

            <router-link tag="li" class="nav-link" to="/register" exact v-show="!userIsRegistered">
                <a><strong>Register</strong></a>
            </router-link>

            <li class="nav-link"></li>
            <li class="nav-link">
                <strong :class="connectedClass">
                    {{ bcConnected ? 'Connected' : 'Not Connected' }}
                </strong>
            </li>
        </ul>
    </nav>
</template>

<script>
    // importing common function
    import mixin from '../libs/mixinViews';

    export default {
        mixins: [mixin],

        data() {
            return {
                tmoConn: null, // contain the intervalID given by setInterval
                tmoReg: null, // contain the intervalID given by setInterval
                connectedClass: 'text-danger', // bootstrap class for the connection status (red when not connected, green when connected)
                userIsRegistered: false, // true when the user that is visiting the page is registered
            }
        },

        methods: {
            /**
             * It checks if the visiting user is regitered calling every 500ms the function isRegistered
             * from the smart contract until the connection with the smart contract is established.
             */
            checkUserIsRegistered() {
                this.tmoConn = setInterval(() => {
                    // checking first if the connection with the blockchain is established
                    if (this.blockchainIsConnected()) {
                        // stopping the setInterval
                        clearInterval(this.tmoConn)
                        // showing the connected message on the top bar and setting the class too
                        this.connectedClass = 'text-success'

                        window.bc.contract().isRegistered.call((error, res) => {
                            if (error) {
                                console.error(error);
                            }
                            else {
                                this.userIsRegistered = res
                            }
                        })
                    }
                }, 500)
            },

            /**
             * Check if the user is registered calling the function of the smart contract isRegistered.
             * This function is used when the user is signing up.
             * The difference with the previous function is:
             *      - the function checkUserIsRegistered tries to check if the user is registered
             *        until the connection with the blockchain is established.
             *      - the function checkUntilUserIsRegistered tries to check if the user is registered
             *        until the user is registered.
             *
             * NOTE: in order to check if the user has been registered successfully the function has to check
             * several time because the block can take several minutes in order to be mined (depending on the
             * configuration of the blockchain you are using).
             */
            checkUntilUserIsRegistered() {
                this.tmoReg = setInterval(() => {
                    if (this.blockchainIsConnected()) {
                        window.bc.contract().isRegistered.call((error, res) => {
                            if (error) {
                                console.error(error)
                            }
                            else if (res) {
                                // stopping the setInterval
                                clearInterval(this.tmoReg)

                                this.userIsRegistered = res
                            }
                        })
                    }
                }, 1000)
            }
        },

        created() {
            // when the event userregistered is fired (from the view Register.vue)
            // it runs the function checkUntilUserIsRegistered
            Event.$on('userregistered', this.checkUntilUserIsRegistered);

            this.checkUserIsRegistered()
        }
    }
</script>

<style>
</style>
