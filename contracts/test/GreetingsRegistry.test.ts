import { expect } from './chai-setup';
import { ethers, deployments, getUnnamedAccounts } from 'hardhat';
import { FootiumLitePlayers } from '../typechain';
import { setupUsers } from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('FootiumLitePlayers');
  const contracts = {
    FootiumLitePlayers: <FootiumLitePlayers>await ethers.getContract('FootiumLitePlayers'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
  };
});
describe('FootiumLitePlayers', function () {
  it('setMessage works', async function () {
    const { users, FootiumLitePlayers } = await setup();
    const testMessage = 'Hello World';
    await expect(users[0].FootiumLitePlayers.setMessage(testMessage))
      .to.emit(FootiumLitePlayers, 'MessageChanged')
      .withArgs(users[0].address, testMessage);
  });
});
