import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import myFridge from "./artifacts/contracts/FridgeSensors.sol/myFridge.json";
import {
  encryptDataField,
  decryptNodeResponse,
} from "@swisstronik/swisstronik.js";

const myContractAddress = "0x5F5A6bEeACeb44A13e609d396385033f458d45c5";

const sendShieldedQuery = async (provider, destination, data) => {
  const rpclink = "https://json-rpc.testnet.swisstronik.com/"; //URL of the RPC node for Swisstronik.
  const [encryptedData, usedEncryptedKey] = await encryptDataField(
    rpclink,
    data
  );
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });
  return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
};

function App() {
  const [fridgeId, setFridgeId] = useState(0);
  const [fridgeData, setFridgeData] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const address = window.ethereum.selectedAddress;
        setWalletAddress(address);
      }
    };

    connectWallet();
  }, []);

  const fetchFridgeData = async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        myContractAddress,
        myFridge.abi,
        provider
      );

      const functionName = "getAllData";
      const functionCallData = contract.interface.encodeFunctionData(
        functionName,
        [fridgeId]
      );

      const responseMessage = await sendShieldedQuery(
        provider,
        myContractAddress,
        functionCallData
      );

      const decodedResponse = contract.interface.decodeFunctionResult(
        functionName,
        responseMessage
      );

      const data = decodedResponse[0].map((item) => {
        const timestamp = Number(item.timestamp);
        const date = new Date(timestamp * 1000); // Convert the timestamp to milliseconds

        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based in JavaScript
        const year = date.getFullYear();

        const formattedDate = `${day}/${month}/${year}`;

        return {
          date: formattedDate,
          temperature: Number(item.temperature),
          humidity: Number(item.humidity),
        };
      });

      // Group the data by date
      const groupedData = data.reduce((groups, item) => {
        const date = item.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});

      setFridgeData(groupedData);
      setButtonClicked(true);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <div className="wallet-status">
          <p>
            Wallet Address:{" "}
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Not connected"}
          </p>
        </div>
        <div className="app-info">
          <h1>Fridge Data Dapp</h1>
          <h2>Your Fridge, Your Data: Monitor with Confidence</h2>
        </div>
        <div className="input-field">
          <input
            type="number"
            placeholder="Fridge Id"
            onChange={(e) => setFridgeId(e.target.value)}
            className="input-field"
          />
        </div>

        <button onClick={() => fetchFridgeData()} className="button">
          Fetch the Fridge's Sensors History
        </button>
        {buttonClicked && Object.keys(fridgeData).length === 0 ? (
          <p className="message">This fridge has no data submitted yet.</p>
        ) : (
          Object.entries(fridgeData).map(([date, data], index) => (
            <div key={index} className="data-container">
              <h2 className="date-header">Date: {date}</h2>
              <div className="container">
                {data.map((item, index) => (
                  <div key={index} className="item-container">
                    <div className="temperature">
                      <p>Temperature: {item.temperature}</p>
                    </div>
                    <div className="humidity">
                      <p>Humidity: {item.humidity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

/*

// PREVIOUS CODE WITH NO WALLET ON THE TOP RIGHT

import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import myFridge from "./artifacts/contracts/FridgeSensors.sol/myFridge.json";
import {
  encryptDataField,
  decryptNodeResponse,
} from "@swisstronik/swisstronik.js";

const myContractAddress = "0x5F5A6bEeACeb44A13e609d396385033f458d45c5";

const sendShieldedQuery = async (provider, destination, data) => {
  const rpclink = "https://json-rpc.testnet.swisstronik.com/"; //URL of the RPC node for Swisstronik.
  const [encryptedData, usedEncryptedKey] = await encryptDataField(
    rpclink,
    data
  );
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });
  return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
};

function App() {
  const [fridgeId, setFridgeId] = useState(0);
  const [fridgeData, setFridgeData] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);

  const fetchFridgeData = async () => {
    
    //To not be asked to log in with MetaMask, we could delete the two following lines and change the third one for:
    //const provider = new ethers.providers.JsonRpcProvider(infuraURL);
    //At the top of the file,we should declare: const infuraURL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";
    
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        myContractAddress,
        myFridge.abi,
        provider
      );

      const functionName = "getAllData";
      const functionCallData = contract.interface.encodeFunctionData(
        functionName,
        [fridgeId]
      );

      const responseMessage = await sendShieldedQuery(
        provider,
        myContractAddress,
        functionCallData
      );

      const decodedResponse = contract.interface.decodeFunctionResult(
        functionName,
        responseMessage
      );

      const data = decodedResponse[0].map((item) => {
        const timestamp = Number(item.timestamp);
        const date = new Date(timestamp * 1000); // Convert the timestamp to milliseconds

        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based in JavaScript
        const year = date.getFullYear();

        const formattedDate = `${day}/${month}/${year}`;

        return {
          date: formattedDate,
          temperature: Number(item.temperature),
          humidity: Number(item.humidity),
        };
      });

      // Group the data by date
      const groupedData = data.reduce((groups, item) => {
        const date = item.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});

      setFridgeData(groupedData);
      setButtonClicked(true);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>TFM Dapp</h1>
        <input
          type="number"
          placeholder="Fridge Id"
          onChange={(e) => setFridgeId(e.target.value)}
          className="input-field"
        />
        <button onClick={() => fetchFridgeData()} className="button">
          Fetch the Fridge's Sensors History
        </button>
        {buttonClicked && Object.keys(fridgeData).length === 0 ? (
          <p className="message">This fridge has no data submitted yet.</p>
        ) : (
          Object.entries(fridgeData).map(([date, data], index) => (
            <div key={index} className="data-container">
              <h2 className="date-header">Date: {date}</h2>
              <div className="container">
                {data.map((item, index) => (
                  <div key={index} className="item-container">
                    <div className="temperature">
                      <p>Temperature: {item.temperature}</p>
                    </div>
                    <div className="humidity">
                      <p>Humidity: {item.humidity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

*/
