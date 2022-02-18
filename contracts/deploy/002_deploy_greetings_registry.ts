import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployments, ethers } from 'hardhat';
const { execute } = deployments;
import fs from 'fs';

const hair: string[] = [];
for (let i = 0; i < 10; i++) {
  hair.push(fs.readFileSync(`svgs/hair/hair${i}.svg`, 'utf8'));
}

const pose: string[] = [];
for (let i = 0; i < 4; i++) {
  pose.push(fs.readFileSync(`svgs/pose/pose${i}.svg`, 'utf8'));
}

const shirt = fs.readFileSync(`svgs/shirt/shirt1.svg`, 'utf8');

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const svgs = await deploy('Svgs', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  for (let i = 0; i < 10; i++) {
    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', hair[i], ethers.utils.formatBytes32String("hair"));
  }

  for (let i = 0; i < 4; i++) {
    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', pose[i], ethers.utils.formatBytes32String("pose"));
  }

  await execute('Svgs', { from: deployer, log: true }, 'storeSvg', shirt, ethers.utils.formatBytes32String("shirt"));

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
