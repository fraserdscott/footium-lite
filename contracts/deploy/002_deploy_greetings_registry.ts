import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployments } from 'hardhat';
const { execute } = deployments;
import fs from 'fs';

const haircutArt = fs.readFileSync('svgs/haircut1.svg', 'utf8');

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const svgs = await deploy('Svgs', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  await execute('Svgs', { from: deployer, log: true }, 'storeSvg', haircutArt);

  const linkToken = await deploy('LinkTokenMock', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const vrfCoordinator = await deploy('VRFCoordinatorMock', {
    from: deployer,
    args: [linkToken.address],
    log: true,
    autoMine: true,
  });

  const players = await deploy('FootiumLitePlayers', {
    from: deployer,
    args: [svgs.address],
    log: true,
    autoMine: true,
  });

  await deploy('FootiumLiteFriendlies', {
    from: deployer,
    args: [vrfCoordinator.address, linkToken.address, players.address],
    log: true,
    autoMine: true,
  });
};

export default func;
func.id = 'deploy_greetings_registry'; // id required to prevent reexecution
func.tags = ['FootiumLitePlayers', 'FootiumLiteFriendlies'];
