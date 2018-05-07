pragma solidity ^0.4.21;



contract Users {
    // data structure that stores a user
    struct User {
        string name;
        bytes32 status;
        address walletAddress;
        uint createdAt;
        uint updatedAt;
    }

    // it maps the user's wallet address with the user ID
    mapping (address => uint) public usersIds;

    // Array of User that holds the list of users and their details
    User[] public users;

    // event fired when an user is registered
    event newUserRegistered(uint id);

    // event fired when the user updates his status or name
    event userUpdateEvent(uint id);



    // Modifier: check if the caller of the smart contract is registered
    modifier checkSenderIsRegistered {
    	require(isRegistered());
    	_;
    }



    /**
     * Constructor function
     */
    function Users() public {
        // NOTE: the first user MUST be emtpy
        addUser(0x0, "", "");

        // Some dummy data
        addUser(0x333333333333, "Leo Brown", "Available");
        addUser(0x111111111111, "John Doe", "Very happy");
        addUser(0x222222222222, "Mary Smith", "Not in the mood today");
    }



    /**
     * Function to register a new user.
     *
     * @param userName 		The displaying name
     * @param status        The status of the user
     */
    function registerUser(string userName, bytes32 status) public
    returns(uint)
    {
    	return addUser(msg.sender, userName, status);
    }



    /**
     * Add a new user. This function must be private because an user
     * cannot insert another user on behalf of someone else.
     *
     * @param wAddr 		Address wallet of the user
     * @param userName		Displaying name of the user
     * @param status    	Status of the user
     */
    function addUser(address wAddr, string userName, bytes32 status) private
    returns(uint)
    {
        // checking if the user is already registered
        uint userId = usersIds[wAddr];
        require (userId == 0);

        // associating the user wallet address with the new ID
        usersIds[wAddr] = users.length;
        uint newUserId = users.length++;

        // storing the new user details
        users[newUserId] = User({
        	name: userName,
        	status: status,
        	walletAddress: wAddr,
        	createdAt: now,
        	updatedAt: now
        });

        // emitting the event that a new user has been registered
        emit newUserRegistered(newUserId);

        return newUserId;
    }



    /**
     * Update the user profile of the caller of this method.
     * Note: the user can modify only his own profile.
     *
     * @param newUserName	The new user's displaying name
     * @param newStatus 	The new user's status
     */
    function updateUser(string newUserName, bytes32 newStatus) checkSenderIsRegistered public
    returns(uint)
    {
    	// An user can modify only his own profile.
    	uint userId = usersIds[msg.sender];

    	User storage user = users[userId];

    	user.name = newUserName;
    	user.status = newStatus;
    	user.updatedAt = now;

    	emit userUpdateEvent(userId);

    	return userId;
    }



    /**
     * Get the user's profile information.
     *
     * @param id 	The ID of the user stored on the blockchain.
     */
    function getUserById(uint id) public view
    returns(
    	uint,
    	string,
    	bytes32,
    	address,
    	uint,
    	uint
    ) {
    	// checking if the ID is valid
    	require( (id > 0) || (id <= users.length) );

    	User memory i = users[id];

    	return (
    		id,
    		i.name,
    		i.status,
    		i.walletAddress,
    		i.createdAt,
    		i.updatedAt
    	);
    }



    /**
     * Return the profile information of the caller.
     */
    function getOwnProfile() checkSenderIsRegistered public view
    returns(
    	uint,
    	string,
    	bytes32,
    	address,
    	uint,
    	uint
    ) {
    	uint id = usersIds[msg.sender];

    	return getUserById(id);
    }



    /**
     * Check if the user that is calling the smart contract is registered.
     */
    function isRegistered() public view returns (bool)
    {
    	return (usersIds[msg.sender] != 0);
    }



    /**
     * Return the number of total registered users.
     */
    function totalUsers() public view returns (uint)
    {
        return users.length;
    }

}
