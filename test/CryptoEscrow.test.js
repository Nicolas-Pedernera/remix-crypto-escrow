const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoEscrow", function () {
  let escrow;
  let buyer;
  let seller;
  let other;

  beforeEach(async function () {
    [buyer, seller, other] = await ethers.getSigners();

    const CryptoEscrow = await ethers.getContractFactory("CryptoEscrow");
    escrow = await CryptoEscrow.deploy();
    await escrow.deployed();
  });

  it("creates an escrow with the deposited amount", async function () {
    const amount = ethers.utils.parseEther("1");

    await expect(
      escrow.connect(buyer).createEscrow(seller.address, {
        value: amount,
      })
    )
      .to.emit(escrow, "EscrowCreated")
      .withArgs(0, buyer.address, seller.address, amount);

    const data = await escrow.getEscrow(0);

    expect(data.buyer).to.equal(buyer.address);
    expect(data.seller).to.equal(seller.address);
    expect(data.amount).to.equal(amount);
    expect(data.status).to.equal(0);
  });

  it("allows the buyer to release funds to the seller", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await expect(escrow.connect(buyer).release(0))
      .to.emit(escrow, "EscrowReleased")
      .withArgs(0, seller.address, amount);

    const data = await escrow.getEscrow(0);

    expect(data.amount).to.equal(0);
    expect(data.status).to.equal(1);
  });

  it("allows the buyer to request a refund", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await expect(escrow.connect(buyer).refund(0))
      .to.emit(escrow, "EscrowRefunded")
      .withArgs(0, buyer.address, amount);

    const data = await escrow.getEscrow(0);

    expect(data.amount).to.equal(0);
    expect(data.status).to.equal(2);

    expect(await ethers.provider.getBalance(escrow.address)).to.equal(0);
  });

  it("prevents another account from releasing the escrow", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await expect(
      escrow.connect(other).release(0)
    ).to.be.reverted;
  });

  it("prevents creating an escrow with zero value", async function () {
    await expect(
      escrow.connect(buyer).createEscrow(seller.address, {
        value: 0,
      })
    ).to.be.reverted;
  });

  it("prevents using the buyer as the seller", async function () {
    const amount = ethers.utils.parseEther("1");

    await expect(
      escrow.connect(buyer).createEscrow(buyer.address, {
        value: amount,
      })
    ).to.be.reverted;
  });

  it("prevents the buyer from releasing an escrow twice", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await escrow.connect(buyer).release(0);

    await expect(
      escrow.connect(buyer).release(0)
    ).to.be.reverted;
  });

  it("prevents a refund after the escrow was released", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await escrow.connect(buyer).release(0);

    await expect(
      escrow.connect(buyer).refund(0)
    ).to.be.reverted;
  });

  it("prevents releasing an escrow after a refund", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await escrow.connect(buyer).refund(0);

    await expect(
      escrow.connect(buyer).release(0)
    ).to.be.reverted;
  });

  it("prevents interacting with a nonexistent escrow", async function () {
    await expect(
      escrow.connect(buyer).release(999)
    ).to.be.reverted;
  });

  it("prevents another account from requesting a refund", async function () {
    const amount = ethers.utils.parseEther("1");

    await escrow.connect(buyer).createEscrow(seller.address, {
      value: amount,
    });

    await expect(
      escrow.connect(other).refund(0)
    ).to.be.reverted;
  });


  it("reverts when the seller rejects ETH", async function () {
    const amount = ethers.utils.parseEther("1");

    const RejectingSeller = await ethers.getContractFactory("RejectingSeller");
    const rejectingSeller = await RejectingSeller.deploy();
    await rejectingSeller.deployed();

    await escrow.connect(buyer).createEscrow(rejectingSeller.address, {
      value: amount,
    });

    await expect(
      escrow.connect(buyer).release(0)
    ).to.be.reverted;

    const data = await escrow.getEscrow(0);

    expect(data.amount).to.equal(amount);
    expect(data.status).to.equal(0);
  });

});
