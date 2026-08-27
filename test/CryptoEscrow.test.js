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
    ).to.be.revertedWith("Only buyer");
  });

  it("prevents creating an escrow with zero value", async function () {
    await expect(
      escrow.connect(buyer).createEscrow(seller.address, {
        value: 0,
      })
    ).to.be.revertedWith("Amount must be greater than zero");
  });

  it("prevents using the buyer as the seller", async function () {
    const amount = ethers.utils.parseEther("1");

    await expect(
      escrow.connect(buyer).createEscrow(buyer.address, {
        value: amount,
      })
    ).to.be.revertedWith("Buyer cannot be seller");
  });
});
