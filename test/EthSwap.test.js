const { assert } = require('chai');

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer,investor]) => {
  let token, ethSwap

  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap.address, tokens('1000000'))
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'Ethereum Exchange')
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe("Buy Tokens", async() =>{
    let result

    before(async() =>{

      result = await ethSwap.buytokens({from : investor,value:tokens("1")})

    })
    it ("allows users to purchase tokens from ethswap for fixed price" , async() => {
      
      let investorbalance = await token.balanceOf(investor)
      assert.equal(investorbalance.toString(),tokens("100"))

      let Ethswapbalance = await token.balanceOf(ethSwap.address)
      assert.equal(Ethswapbalance.toString(),tokens("999900"))

      Ethswapbalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(Ethswapbalance.toString(),web3.utils.toWei("1","Ether"))

      // console.log(result.logs)

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })


  describe("Sell Tokens", async() =>{
    let result

    before(async() =>{


      //must approve spender
      await token.approve(ethSwap.address, tokens('100'),{from : investor})

      result = await ethSwap.selltokens(tokens('100'),{from : investor})

    })
    it ("allows users to sell tokens from ethswap for fixed price" , async() => {
      
      let investorbalance = await token.balanceOf(investor)
      assert.equal(investorbalance.toString(),tokens("0"))

      let Ethswapbalance = await token.balanceOf(ethSwap.address)
      assert.equal(Ethswapbalance.toString(),tokens("1000000"))

      Ethswapbalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(Ethswapbalance.toString(),web3.utils.toWei("0","Ether"))

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      //Failure: investor cant sell more tokens than they have

      await ethSwap.selltokens(tokens('500'),{from : investor}).should.be.rejected

      
    })
  })


})