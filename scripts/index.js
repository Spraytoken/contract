// scripts/index.js
async function main() {
  // Retrieve accounts from the local node
  const accounts = await ethers.provider.listAccounts();
  console.log(accounts);

  // Set up an ethers contract, representing our deployed Box instance
  const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  const Spray = await ethers.getContractFactory("Spray");
  const spray = await Spray.attach(address);

  console.log((await spray.totalSupply()).toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
