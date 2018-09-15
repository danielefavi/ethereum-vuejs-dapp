var Users = artifacts.require('./Users.sol');

contract('Users', function(accounts) {
    var instance = null; // store the Users contract instance
    var mainAccount = accounts[0];
    var anotherAccount = accounts[1];

    // TEST: register a new user and check if the total users is increased and if the
    // user has been registered correctly.
    it("should register an user", function() {
        var usersBeforeRegister = null;

        return Users.deployed().then(function(contractInstance) {
            // storing the contract instance so it will be used later on
            instance = contractInstance;

            // calling the smart contract function totalUsers to get the current number of users
            return instance.totalUsers.call();
        }).then(function(result) {
            // storing the current number on the var usersBeforeRegister
            usersBeforeRegister = result.toNumber();

            // registering the user calling the smart contract function registerUser
            return instance.registerUser('Test User Name', 'Test Status', {
                from: mainAccount
            });
        }).then(function(result) {
            return instance.totalUsers.call();
        }).then(function(result) {
            // checking if the total number of user is increased by 1
            assert.equal(result.toNumber(), (usersBeforeRegister+1), "number of users must be (" + usersBeforeRegister + " + 1)");

            // calling the smart contract function isRegistered to know if the sender is registered.
            return instance.isRegistered.call();
        }).then(function(result) {
            // we are expecting a boolean in return that it should be TRUE
            assert.isTrue(result);
        });
    }); // end of "should register an user"



    // Testing the data of the user profile stored in the blockchain match with the data
    // gave during the registration.
    it("username and status in the blockchian should be the same the one gave on the registration", function() {
        // NOTE: the contract instance has been instantiated before, so no need
        // to do again: return Users.deployed().then(function(contractInstance) { ...
        // like before in "should register an user".
        return instance.getOwnProfile.call().then(function(result) {
            // the result is an array where in the position 0 there user ID, in
            // the position 1 the user name and in the position 2 the status,
            assert.equal(result[1], 'Test User Name');

            // the status is type of bytes32: converting the status Bytes32 into string
            let newStatusStr = web3.toAscii(result[2]).replace(/\u0000/g, '');
            assert.equal(newStatusStr, 'Test Status');
        });
    }); // end testing username and status



    // Testing the update profile function: first update the user's profile name and status, then
    // chching that the profile has been updated correctly.
    it("should update the profile", function() {
        return instance.updateUser('Updated Name', 'Updated Status', {
            from: mainAccount
        }).then(function(result) {
            return instance.getOwnProfile.call();
        }).then(function(result) {
            // the result is an array where in the position 0 there user ID, in
            // the position 1 the user name and in the position 2 the status,
            assert.equal(result[1], 'Updated Name');

            // the status is type of bytes32: converting the status Bytes32 into string
            let newStatusStr = web3.toAscii(result[2]).replace(/\u0000/g, '');
            assert.equal(newStatusStr, 'Updated Status');
        });
    }); // end should update the profile



    // Testing that a user cannot register itself twice.
    it("a registered user should not be registered twice", function() {
        // we are expecting the call to registerUser to fail since the user account
        // is already registered!
        return instance.registerUser('Test username Twice', 'Test Status Twice', {
            from: mainAccount
        }).then(assert.fail).catch(function(error) { // here we are expecting the exception
            assert(true);
        });
    }); // end testing registration twice

}); // end Users contract
