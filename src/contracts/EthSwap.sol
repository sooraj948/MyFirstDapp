pragma solidity ^0.5.0;

import "./Token.sol";
contract EthSwap {

    string public name  = "Ethereum Exchange";

    Token public token;

    uint public rate = 100;//1ETH  = rate Dapp


    event TokensPurchased(
    address account,
    address token,
    uint amount,
    uint rate
  );

  event TokensSold(
    address account,
    address token,
    uint amount,
    uint rate
  );

    constructor(Token _token) public {

        token = _token;

    }

    function buytokens() public payable {
        uint tokenAmount = msg.value * rate;

        //this==ethswap
        //require that liquidity pool has enuf tokens

        require(token.balanceOf(address(this)) >= tokenAmount);


        token.transfer(msg.sender , tokenAmount);

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }


    function selltokens(uint _amount) public  {

        //user cannot sell more than he has

        require(token.balanceOf(msg.sender) >= _amount);

        //perform sale

        uint etherAmount = _amount/rate;

        require((address(this)).balance >= etherAmount);

        msg.sender.transfer(etherAmount);//ethereum transfer..different from our transfer

        token.transferFrom(msg.sender, address(this),  _amount);//transfer our tokens to liq pool/ethswap

        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
    

}
