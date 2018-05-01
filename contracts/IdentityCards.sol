pragma solidity ^0.4.21;



contract IdentityCards {

    struct IdCard {
        string name;
        bytes32 cardNumber;
        address walletAddress;
        uint createdAt;
        uint updatedAt;
    }

    // it maps the user wallet address with the ID card
    mapping (address => uint) public usersIdCards;
    // Identity card list where the array key is the id of the user
    IdCard[] public idCards;

    // event fired when an user registers a new identity card
    event newCardRegistered(uint id);

    // event fired when the user updates its own identity card
    event userUpdateEvent(uint id);



	// Modifier: check if the caller of the smart contract has registered his identity card.
	modifier checkSenderIsRegistered {
		require(isRegistered());
		_;
	}




    /**
     * Constructor function
     */
    function IdentityCards() public {
        addCard(0x0, "", ""); // NOTE: the first card MUST be emtpy

        /* Some dummy data */
        addCard(0x333333333333, "Leo Brown", "ABT9999999999999");
        addCard(0x111111111111, "John Doe", "ABC1111111111111");
        addCard(0x222222222222, "Mary Smith", "ABX3333333333333");
    }



    /**
     * Allow a user to register itself.
     *
     * @param userName 		The name that will appear on the card
     * @param cardNumber	The identity card number
     */
    function registerUser(string userName, bytes32 cardNumber) public 
	returns(uint)
    {
    	return addCard(msg.sender, userName, cardNumber);
    }



    /**
     * Add a user with his information.
     *
     * @param wAddr 		Address of the identity card to add
     * @param userName		Name of the owner of the identity card
     * @param cardNumber	Number of the user's cidentity card
     */
    function addCard(address wAddr, string userName, bytes32 cardNumber) private
	returns(uint)
    {
		uint userCardId = usersIdCards[wAddr];

		// user' card ID must not exist
		require (userCardId == 0);

		usersIdCards[wAddr] = idCards.length;
		uint newUserCardId = idCards.length++;

		idCards[newUserCardId] = IdCard({
			name: userName,
			cardNumber: cardNumber,
			walletAddress: wAddr,
			createdAt: now,
			updatedAt: now
		});

		emit newCardRegistered(newUserCardId);

		return newUserCardId;
    }




    /**
     * Update the identity card of the caller of this method.
     * Note: the user can modify only his own ID card.
     * 
     * @param newUserName		The new name that will appear on the identity card
     * @param newCardNumber		The new user's identity card number
     */
    function updateCard(string newUserName, bytes32 newCardNumber) checkSenderIsRegistered public
	returns(uint)
    {
    	// An user can modify only his own ID card.
		uint userId = usersIdCards[msg.sender];

		IdCard storage idCard = idCards[userId];

		idCard.name = newUserName;
		idCard.cardNumber = newCardNumber;
		idCard.updatedAt = now;

		emit userUpdateEvent(userId);

		return userId;
    }




    /**
     * Get the user's card information by card ID.
     * 
     * @param id 	The ID of the identity card stored on the blockchain
     */
	function getCardById(uint id) public view
	returns(
		uint,
		string,
		bytes32,
		address,
		uint,
		uint
	) {
		// checking if the 
		require( (id > 0) || (id <= idCards.length) );

		IdCard memory i = idCards[id];

		return (
			id,
			i.name,
			i.cardNumber,
			i.walletAddress,
			i.createdAt,
			i.updatedAt
		);
	}



	/**
	 * Return the identity card of the caller of this method.
	 */
	function getOwnCard() checkSenderIsRegistered public view
	returns(
		uint,
		string,
		bytes32,
		address,
		uint,
		uint
	) {
		uint id = usersIdCards[msg.sender];

		return getCardById(id);
	}



	/**
	 * Check if the user that is calling the smart contract has registered his identity card.
	 */
	function isRegistered() public view returns (bool)
	{
		return (usersIdCards[msg.sender] != 0);
	}



    /**
     * Return the number of total identity cards.
     */
    function totalIdCards() public view returns (uint)
    {
        return idCards.length;
    }


}
