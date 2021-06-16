// scripts/deploy.js
async function main() {
  // We get the contract to deploy
  const Spray = await ethers.getContractFactory("Spray");
  console.log("Deploying Spray...");
  const spray = await Spray.deploy();
  await spray.deployed();
  console.log("Spray deployed to:", spray.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });