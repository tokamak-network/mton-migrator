import isEmpty from 'lodash/isEmpty';

export const fetchNetwork = (web3) => {
  return new Promise((resolve, reject) => {

    web3 && web3.eth.net && web3.eth.net.getId((err, netId) => {
      if (err) {
        reject(err);
      } else {
        resolve(netId);
      }
    });
  });
};

export const fetchAccounts = (web3) => {
  return new Promise((resolve, reject) => {
    web3 && web3.eth && web3.eth.getAccounts((err, accounts) => {
      if (err) {
        reject(err);
      } else {
        resolve(accounts);
      }
    });
  });
};

export const networkName = (netId) => {
  switch (netId) {
    case 1:
      return 'Ethereum mainnet';
    case 2:
      return 'Ropsten testnet';
    case 16:
      return 'Plasma EVM Faraday testnet';
    default:
      return `Private network (id=${netId})`;
  }
}