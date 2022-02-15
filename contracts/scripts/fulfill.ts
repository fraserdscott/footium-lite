import { deployments } from 'hardhat';
const { execute, get } = deployments;

const args = process.argv.slice(2);
const requestId = args[0];

async function main() {
  const friendliesArtifact = await get('FootiumLiteFriendlies');

  const accountAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

  await execute('VRFCoordinatorMock', { from: accountAddress, log: true }, 'callBackWithRandomness', requestId, 7, friendliesArtifact.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });