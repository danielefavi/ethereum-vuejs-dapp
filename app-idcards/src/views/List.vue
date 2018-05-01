<template>
	<div>
        <h1 class="title">Card List</h1>

        <button class="btn btn-primary float-right" @click="reloadList">Reload</button>
        <div class="clearfix"></div>

        <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

        <h2 v-show="(isLoading && bcConnected)">Loading...</h2>

        <table class="table table-striped" v-show="!isLoading">
            <thead class="thead-dark">
                <tr>
                    <th>Card ID</th>
                    <th>Name</th>
                    <th>Card Number</th>
                    <th>Address</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="idCard in idCards">
                    <td>{{ idCard[0].toNumber() }}</td>
                    <td>{{ idCard[1] }}</td>
                    <td>{{ toAscii(idCard[2]) }}</td>
                    <td>{{ idCard[3] }}</td>
                    <td>{{ toDate( idCard[4].toNumber() ) }}</td>
                    <td>{{ toDate( idCard[5].toNumber() ) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    // importing common function
    import mixin from '../libs/mixinViews';

    /**
     * List view component: this component shows list of the identity cards
     * of all registered users.
     */
    export default {
        mixins: [mixin],
        
        data() {
            return {
                idCards: [], // array that stores all the user's identity cards
                isLoading: true, // true when the card list is loading form the blockchain
                bcConnected: false, // blockchain is connected ()
                tmoConn: null, // contain the intervalID given by setInterval
            }
        },

        methods: {
            /**
             * Get the list of identity cards once the connection to the
             * blockchain is established.
             */
            getCardList() {
                if (this.blockchainIsConnected()) {
                    // it shows the loading message
                    this.isLoading = true

                    // stopping the interval
                    clearInterval(this.tmoConn)

                    // getting all the identity cards from the blockchain
                    window.bc.getAllCards(card => {
                        this.isLoading = false
                        this.idCards.push(card)
                    })
                }
            },

            /**
             * It reloads the identity card list.
             */
            reloadList() {
                this.idCards = []

                this.getCardList()
            }
        },

        created() {
            // it tries to get the card list from the blockchian once
            // the connection is established
            this.tmoConn = setInterval(() => {
                this.getCardList()
            }, 1000)
        }
    }
</script>

<style>

</style>