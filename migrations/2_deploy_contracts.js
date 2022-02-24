const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
    //Deploy token
    await deployer.deploy(Token);
    const token = await Token.deployed();
    
    //Deploy ethswap
    await deployer.deploy(EthSwap,token.address);
    const ethswap = await EthSwap.deployed();

    //Transfer all tokens to eth swap
    await token.transfer(ethswap.address , "1000000000000000000000000")
};
