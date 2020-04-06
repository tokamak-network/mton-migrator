import React, { Component } from 'react';
import Web3 from 'web3';

import { createCurrency } from '@makerdao/currency';

import MTONArtifact from './contracts/MTON.json';
import MTONMigratorArtifact from './contracts/MTONMigrator.json';
import addresses from './addresses.js';

import {fetchAccounts, fetchNetwork, networkName } from "./services/Web3Service";

import './App.css';


const _MTON = createCurrency('MTON');

const addressSelector = (netId) => {
  switch (netId) {
    case 1:
      return addresses['ethereum'];
    default:
      return addresses['development'];
  }
}

class App extends Component {
  state = {
    // env
    web3: false,
    accounts: [],
    netId: 0,
    mton: null,
    migrator: null,

    // balances
    mtonBalance: null,
    migratorBalance: null,
  }

  constructor() {
    super();

    this.renderAccount = this.renderAccount.bind(this);
    this.renderLoginButton = this.renderLoginButton.bind(this);
    this.claimAll = this.claimAll.bind(this);
  }

  handleClick = async () => {
    let provider;
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable();
        provider = window.ethereum;
      } catch (e) {
        if (e.stack.includes('Error: User denied account authorization')) {
          throw new Error('User denied account authorization');
        } else {
          throw new Error(e.message);
        }
      }
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      throw new Error('No web3 provider detected');
    }

    const web3 =  new Web3(provider);
    const accounts = await fetchAccounts(web3);
    const netId = await fetchNetwork(web3);

    const addrs = addressSelector(netId);

    console.log("addrs", addrs);

    // new web3.eth.Contract(jsonInterface[, address][, options])

    const mton = new web3.eth.Contract(MTONArtifact.abi, addrs.MTON);
    const migrator = new web3.eth.Contract(MTONMigratorArtifact.abi, addrs.MTONMigrator);

    window.mton = mton;
    window.migrator = migrator;

    const mtonBalance = await mton.methods.balanceOf(accounts[0]).call();
    const migratorBalance = await migrator.methods.claimable(accounts[0]).call();

    console.log("mtonBalance", mtonBalance);
    console.log("migratorBalance", migratorBalance);

    this.setState({
      web3,
      accounts,
      netId,
      mton,
      migrator,
      mtonBalance,
      migratorBalance,
    });
  };

  async claimAll() {
    const { accounts, migrator } = this.state;
    const from = accounts[0];

    const self = this;

    migrator.methods.claimAll().send({ from })
      .on('transactionHash', function(tx){
        self.setState({ tx });
      });
  }

  renderLoginButton() {
    const { web3 } = this.state;

    return (
      <div>
        <button className="Login-button Login-mm" onClick={this.handleClick}>
          {web3 ? 'Loading...' : 'Login with MetaMask'}
        </button>
      </div>
    );
  }

  renderAccount() {
    const {
      accounts,
      netId,
      mton,
      migrator,
      mtonBalance,
      migratorBalance,
      tx = null,
    } = this.state;

    const from = accounts[0];

    return (
      <div>
        <p>
          Using {networkName(netId)}
          <br />
          Logged in as {from}
          <br />
          MTON deployed at {mton._address}
          <br />
          MTONMigrator deployed at {migrator._address}
        </p>

        <br />

        <p>
          MTON balance: {_MTON.wei(mtonBalance).toString()}
          <br />
          Claimable MTON: {_MTON.wei(migratorBalance).toString()}
          <br />
        </p>

        {
          tx && <p>
            tx: {tx}
          </p>
        }

        <button onClick={this.claimAll}>
          claim MTON
        </button>
      </div>
    );
  }

  render() {
    const { web3 } = this.state;

    const R = !web3 ? this.renderLoginButton
      : this.renderAccount;


    return (
      <div className="App">
        <header className="App-header">

        < R />

        </header>
      </div>
    );
  }
}

export default App;
