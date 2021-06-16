// test/Spray.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const Spray = artifacts.require('Spray');
const AggregatorWrapper = artifacts.require('AggregatorWrapper');

// Start Spray block
contract('Spray', function ([owner, acc1, acc2]) {

  const INIT_SUPPLY = new BN('50000000000000000000000');

  describe("Test constants", async function () {
    before(async function () {
      this.spray = await Spray.new({ from: owner });
    });

    it('Name is correct', async function () {
      expect(await this.spray.name()).to.be.equal("spraytoken.net");
    });
    it('Symbol is correct', async function () {
      expect(await this.spray.symbol()).to.be.equal("SPRAY");
    });
    it('Decimals is correct', async function () {
      expect(await this.spray.decimals()).to.be.bignumber.equal(new BN('8'));
    });
  });
  describe("Standart tests", async function () {

    before(async function () {
      this.spray = await Spray.new({ from: owner });
      this.aggregator = await AggregatorWrapper.new({ from: owner });

      await this.spray.updateAggregator(this.aggregator.address);
    });

    describe("Starting supply test", async function () {
      it('Total supply is correct', async function () {
        expect(await this.spray.totalSupply()).to.be.bignumber.equal(INIT_SUPPLY);
      });
      it('Supply all money to owner', async function () {
        expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal(INIT_SUPPLY);
      });
    });

    describe("Send owner to acc1", async function () {
      it('Unknown account have no balance', async function () {
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('0');
      });
      it('Transfer', async function () {
        await this.spray.transfer(acc1, INIT_SUPPLY.div(new BN('2')));
      });
      it('Check owner balance', async function () {
        expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal('25253807106598984771573');
      });
      it('Check recipient balance', async function () {
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('24496192893401015228426');
      });
      it('Check emission', async function () {
        let bal0 = await this.spray.balanceOf(owner);
        let bal1 = await this.spray.balanceOf(acc1);
        let total = await this.spray.totalSupply();
        expect(total.sub(bal0).sub(bal1)).to.be.bignumber.lte(new BN('2'));
      });
    });

    describe("Send acc1 to acc2", async function () {
      it('Unknown account have no balance', async function () {
        expect(await this.spray.balanceOf(acc2)).to.be.bignumber.equal('0');
      });
      it('Transfer', async function () {
        await this.spray.transfer(acc2, INIT_SUPPLY.div(new BN('20')), { from: acc1 });
      });
      it('Check owner balance', async function () {
        expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal('25279226137405828238882');
      });
      it('Check sender balance', async function () {
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('22018332996967599038419');
      });
      it('Check recipient balance', async function () {
        expect(await this.spray.balanceOf(acc2)).to.be.bignumber.equal('2427440865626572722697');
      });
      it('Check emission', async function () {
        let bal0 = await this.spray.balanceOf(owner);
        let bal1 = await this.spray.balanceOf(acc1);
        let bal2 = await this.spray.balanceOf(acc2);
        let total = await this.spray.totalSupply();
        expect(total.sub(bal0).sub(bal1).sub(bal2)).to.be.bignumber.lte(new BN('3'));
      });
    });
  });

  describe("Trand test", async function () {

    before(async function () {
      this.spray = await Spray.new({ from: owner });
      this.aggregator = await AggregatorWrapper.new({ from: owner });

      await this.spray.updateAggregator(this.aggregator.address);
    });

    it('Init trand is up', async function () {
      expect(await this.spray.isTrandUp()).to.be.true;
    });
    it('Updated trand is up', async function () {
      await this.aggregator.update('5', '5', '5', '5', '5');
      await this.spray.updateTrand();
      expect(await this.spray.isTrandUp()).to.be.true;
    });
    it('Updated trand is down', async function () {
      await this.aggregator.update('1', '1', '1', '1', '1');
      await this.spray.updateTrand();
      expect(await this.spray.isTrandUp()).to.be.false;
    });
  });

  describe("Allowance tests", async function () {

    before(async function () {
      this.spray = await Spray.new({ from: owner });
      this.aggregator = await AggregatorWrapper.new({ from: owner });

      await this.spray.updateAggregator(this.aggregator.address);
    });

    it('Unknown account have no allowance', async function () {
      expect(await this.spray.allowance(owner, acc2)).to.be.bignumber.equal('0');
    });
    it('Approve', async function () {
      await this.spray.approve(acc2, INIT_SUPPLY);
    });
    it('Transfer from acc2', async function () {
      await this.spray.transferFrom(owner, acc1, INIT_SUPPLY.div(new BN('2')), { from: acc2 });
    });
    it('Check owner balance', async function () {
      expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal('25253807106598984771573');
    });
    it('Check recipient balance', async function () {
      expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('24496192893401015228426');
    });
    it('Check allowance', async function () {
      expect(await this.spray.allowance(owner, acc2)).to.be.bignumber.equal(INIT_SUPPLY.div(new BN('2')));
    });
    it('Increse allowance', async function () {
      await this.spray.increaseAllowance(acc2, INIT_SUPPLY);
      expect(await this.spray.allowance(owner, acc2)).to.be.bignumber.equal(INIT_SUPPLY.div(new BN('2')).add(INIT_SUPPLY));
    });
    it('Decrese allowance', async function () {
      await this.spray.decreaseAllowance(acc2, INIT_SUPPLY);
      expect(await this.spray.allowance(owner, acc2)).to.be.bignumber.equal(INIT_SUPPLY.div(new BN('2')));
    });
  });

  describe("Excluded tests", async function () {

    before(async function () {
      this.spray = await Spray.new({ from: owner });
      this.aggregator = await AggregatorWrapper.new({ from: owner });

      await this.spray.updateAggregator(this.aggregator.address);
    });

    describe("Check exclude account", async function () {
      it('Check exclude flag', async function () {
        expect(await this.spray.isExcluded(owner)).to.be.false;
      });
      it('Exclude accounts', async function () {
        await this.spray.excludeSelf();
      });
      it('Check exclude flag', async function () {
        expect(await this.spray.isExcluded(owner)).to.be.true;
      });
    });

    describe("Send owner to acc1", async function () {
      it('Unknown account have no balance', async function () {
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('0');
      });
      let amount = INIT_SUPPLY.div(new BN('2'));
      it('Transfer', async function () {
        await this.spray.transfer(acc1, amount);
      });
      it('Check owner balance', async function () {
        expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal(INIT_SUPPLY.sub(amount));
      });
      it('Check recipient balance', async function () {
        let rAmount = amount.mul(new BN('97')).div(new BN('100'));
        let feeAmount = amount.mul(new BN('3')).div(new BN('100')).mul(new BN('2')).div(new BN('3'));
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal(rAmount.add(feeAmount));
      });
    });

    describe("Send acc1 to owner", async function () {
      it('Transfer', async function () {
        await this.spray.transfer(owner, await this.spray.balanceOf(acc1), { from: acc1 });
      });
      it('Check owner balance', async function () {
        expect(await this.spray.balanceOf(owner)).to.be.bignumber.equal(await this.spray.totalSupply());
      });
      it('Check acc1 balance', async function () {
        expect(await this.spray.balanceOf(acc1)).to.be.bignumber.equal('0');
      });
    });

    describe("Check emission", async function () {
      it('Check emission', async function () {
        let bal0 = await this.spray.balanceOf(owner);
        let bal1 = await this.spray.balanceOf(acc1);
        let bal2 = await this.spray.balanceOf(acc2);
        let total = await this.spray.totalSupply();
        expect(total.sub(bal0).sub(bal1).sub(bal2)).to.be.bignumber.lte(new BN('3'));
      });
      it('Include acc', async function () {
        await this.spray.includeAccount(owner);
      });
      it('Check emission', async function () {
        let bal0 = await this.spray.balanceOf(owner);
        let bal1 = await this.spray.balanceOf(acc1);
        let bal2 = await this.spray.balanceOf(acc2);
        let total = await this.spray.totalSupply();
        expect(total.sub(bal0).sub(bal1).sub(bal2)).to.be.bignumber.lte(new BN('3'));
      });
    });
  });

  describe("Revert tests", async function () {
    beforeEach(async function () {
      this.spray = await Spray.new({ from: owner });
    });

    it('Check transfer too big amount', async function () {
      await expectRevert(this.spray.transfer(acc1, INIT_SUPPLY.mul(new BN('10'))), "ERC20: transfer amount exceeds balance");
    });
    it('Check transfer over balance', async function () {
      await expectRevert(this.spray.transfer(acc2, INIT_SUPPLY, { from: acc1 }), "ERC20: transfer amount exceeds balance");
    });
    it('Check transfer over balance for exclude account', async function () {
      await this.spray.excludeAccount(acc1);
      await expectRevert(this.spray.transfer(acc2, INIT_SUPPLY, { from: acc1 }), "ERC20: transfer amount exceeds balance");
    });
    it('Check transfer over allowance for account', async function () {
      await this.spray.approve(acc1, new BN('1'));
      await expectRevert(this.spray.transferFrom(owner, acc2, new BN('2'), { from: acc1 }), "ERC20: transfer amount exceeds allowance");
    });
    it('Check decrease allowance over allowance for account', async function () {
      await this.spray.approve(acc1, new BN('1'));
      await expectRevert(this.spray.decreaseAllowance(acc1, new BN('2')), "ERC20: decreased allowance below zero");
    });
    it('Check twice exclude for account', async function () {
      await this.spray.excludeAccount(acc1);
      await expectRevert(this.spray.excludeAccount(acc1), "Account is already excluded");
    });
    it('Check twice include for account', async function () {
      await expectRevert(this.spray.includeAccount(acc1), "Account is already included");
    });
    it('Check fail update aggregator info', async function () {
      await expectRevert.unspecified(this.spray.updateTrand());
    });
    it('Check fail update aggregator with incorrect contract address', async function () {
      await expectRevert.unspecified(this.spray.updateAggregator(this.spray.address));
    });
    it('Check fail update aggregator with incorrect user address', async function () {
      await expectRevert(this.spray.updateAggregator(owner), "Address: call to non-contract");
    });
    // it('Check send from zero address', async function () {
    //   await expectRevert(this.spray.transfer(acc1, new BN('1'), { from: constants.ZERO_ADDRESS }), "ERC20: transfer from the zero address");
    // });
    it('Check send to zero address', async function () {
      await expectRevert(this.spray.transfer(constants.ZERO_ADDRESS, new BN('1')), "ERC20: transfer to the zero address");
    });
    // it('Check approve from zero address', async function () {
    //   await expectRevert(this.spray.approve(acc1, new BN('1'), { from: constants.ZERO_ADDRESS }), "ERC20: approve from the zero address");
    // });
    it('Check approve to zero address', async function () {
      await expectRevert(this.spray.approve(constants.ZERO_ADDRESS, new BN('1')), "ERC20: approve to the zero address");
    });
    it('Update aggregator only from owner', async function () {
      await expectRevert(this.spray.updateAggregator(constants.ZERO_ADDRESS, { from: acc1 }), "Ownable: caller is not the owner");
    });
    it('Include account only from owner', async function () {
      await expectRevert(this.spray.includeAccount(constants.ZERO_ADDRESS, { from: acc1 }), "Ownable: caller is not the owner");
    });
    it('Exclude account only from owner', async function () {
      await expectRevert(this.spray.excludeAccount(constants.ZERO_ADDRESS, { from: acc1 }), "Ownable: caller is not the owner");
    });
  });

  describe("Events tests", async function () {
    it('New contract send Transfer event', async function () {
      this.spray = await Spray.new({ from: owner });
      expectEvent.inConstruction(this.spray, 'Transfer', {
        from: constants.ZERO_ADDRESS,
        to: owner,
        value: INIT_SUPPLY,
      });
    });
    it('Update aggregator send UpdateAggregator event', async function () {
      this.aggregator = await AggregatorWrapper.new({ from: owner });
      expectEvent(await this.spray.updateAggregator(this.aggregator.address), 'UpdateAggregator', {
        newAggregator: this.aggregator.address
      });
    });
    it('Transfer send Transfer event', async function () {
      expectEvent(await this.spray.transfer(acc1, INIT_SUPPLY.div(new BN('2'))), 'Transfer', {
        from: owner,
        to: acc1,
        value: INIT_SUPPLY.div(new BN('2')).mul(new BN('97')).div(new BN('100')),
      });
    });
    it('Approve send Approval event', async function () {
      expectEvent(await this.spray.approve(acc1, INIT_SUPPLY), 'Approval', {
        owner: owner,
        spender: acc1,
        value: INIT_SUPPLY,
      });
    });
  });
});