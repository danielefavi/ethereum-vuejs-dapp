<template>
	<div>
		<button class="btn btn-primary float-right btn-top" @click="reloadList">Reload</button>
        <h1 class="title">User List</h1>

        <div class="clearfix"></div>

        <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

        <h2 v-show="(isLoading && bcConnected)">Loading...</h2>

        <table class="table table-striped" v-show="!isLoading">
            <thead class="thead-dark">
                <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Address</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users">
                    <td>{{ user[0].toNumber() }}</td>
                    <td>{{ user[1] }}</td>
                    <td>{{ toAscii(user[2]) }}</td>
                    <td>{{ user[3] }}</td>
                    <td>{{ toDate( user[4].toNumber() ) }}</td>
                    <td>{{ toDate( user[5].toNumber() ) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    // importing common function
    import mixin from '../libs/mixinViews';

    /**
     * List view component: this component shows list of the registered users
     * and their statuses.
     */
    export default {
        mixins: [mixin],

        data() {
            return {
                users: [], // array that stores all the registered users
                isLoading: true, // true when the user list is loading form the blockchain
                bcConnected: false, // blockchain is connected ()
                tmoConn: null, // contain the intervalID given by setInterval
            }
        },

        methods: {
            /**
             * Get the list of the registered users once the connection to the
             * blockchain is established.
             */
            getUserList() {
                if (this.blockchainIsConnected()) {
                    // it shows the loading message
                    this.isLoading = true

                    // stopping the interval
                    clearInterval(this.tmoConn)

                    // getting all the users from the blockchain
                    this.getAllUsers(userProfile => {
                        this.isLoading = false
                        this.users.push(userProfile)
                    })
                }
            },

            /**
             * It reloads the user list.
             */
            reloadList() {
                this.users = []

                this.getUserList()
            },

			/**
			 * Get all users.
			 */
			getAllUsers(callback) {
				// getting the total number of users stored in the blockchain
				// calling the method totalUsers from the smart contract
				window.bc.contract().totalUsers.call((err, total) => {
					var tot = 0
					if (total) tot = total.toNumber()

					if (tot > 0) {
						// getting the user one by one
						for (var i=1; i<tot; i++) {

							window.bc.contract().getUserById.call(i, (error, userProfile) => {
								callback(userProfile)
							})

						} // end for
					} // end if

				}) // end totalUsers call
			}
        },

        created() {
            // it tries to get the user list from the blockchian once
            // the connection is established
            this.tmoConn = setInterval(() => {
                this.getUserList()
            }, 1000)
        }
    }
</script>

<style>
	.btn-top {
		margin-top: 10px;
	}
</style>
