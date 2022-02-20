import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployments, ethers } from 'hardhat';
const { execute } = deployments;
import fs from 'fs';

const storeSvgs = false;

const hair: string[] = [];
for (let i = 0; i < 10; i++) {
  hair.push(fs.readFileSync(`svgs/hair/hair${i}.svg`, 'utf8'));
}

const pose: string[] = [];
for (let i = 0; i < 4; i++) {
  pose.push(fs.readFileSync(`svgs/pose/pose${i}.svg`, 'utf8'));
}

const shirt = fs.readFileSync(`svgs/shirt/shirt1.svg`, 'utf8');

const brow: string[] = [];
for (let i = 0; i < 8; i++) {
  brow.push(fs.readFileSync(`svgs/brow/brows${i}.svg`, 'utf8'));
}

const eye: string[] = [];
for (let i = 0; i < 10; i++) {
  eye.push(fs.readFileSync(`svgs/eye/eyes${i}.svg`, 'utf8'));
}

const facial: string[] = [];
for (let i = 0; i < 9; i++) {
  facial.push(fs.readFileSync(`svgs/facial/facial${i}.svg`, 'utf8'));
}

const nose: string[] = [];
for (let i = 0; i < 3; i++) {
  nose.push(fs.readFileSync(`svgs/nose/nose${i}.svg`, 'utf8'));
}

const mouth: string[] = [];
for (let i = 0; i < 10; i++) {
  mouth.push(fs.readFileSync(`svgs/mouth/mouth${i}.svg`, 'utf8'));
}

const shorts = fs.readFileSync(`svgs/shorts/shorts0.svg`, 'utf8');
const shoes = fs.readFileSync(`svgs/shoes/shoes0.svg`, 'utf8');
const socks = fs.readFileSync(`svgs/socks/socks0.svg`, 'utf8');

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const svgs = await deploy('Svgs', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  if (storeSvgs) {
    for (let i = 0; i < 10; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', hair[i], ethers.utils.formatBytes32String("hair"));
    }

    for (let i = 0; i < 4; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', pose[i], ethers.utils.formatBytes32String("pose"));
    }

    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', shirt, ethers.utils.formatBytes32String("shirt"));

    for (let i = 0; i < 8; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', brow[i], ethers.utils.formatBytes32String("brow"));
    }

    for (let i = 0; i < 10; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', eye[i], ethers.utils.formatBytes32String("eye"));
    }

    for (let i = 0; i < 9; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', facial[i], ethers.utils.formatBytes32String("facial"));
    }

    for (let i = 0; i < 3; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', nose[i], ethers.utils.formatBytes32String("nose"));
    }

    for (let i = 0; i < 10; i++) {
      await execute('Svgs', { from: deployer, log: true }, 'storeSvg', mouth[i], ethers.utils.formatBytes32String("mouth"));
    }

    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', shorts, ethers.utils.formatBytes32String("shorts"));
    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', shoes, ethers.utils.formatBytes32String("shoes"));
    await execute('Svgs', { from: deployer, log: true }, 'storeSvg', socks, ethers.utils.formatBytes32String("socks"));
  }

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
    args: [svgs.address, ["Fraser", "George", "Jordan", "Sam"], ["Benton", "Scott", "Lord", "Jackson"]],
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
