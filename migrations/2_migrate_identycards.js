var IdentityCards = artifacts.require("./IdentityCards.sol");

module.exports = function(deployer) {
    deployer.deploy(IdentityCards);
};
