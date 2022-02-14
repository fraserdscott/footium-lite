import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

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
    args: [],
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
