import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FridgeIPFS from "./artifacts/contracts/FridgeSensorsIPFSOwner.sol/FridgeIPFSOwner.json";
import { encryptDataField } from "@swisstronik/swisstronik.js";

const myContractAddress = "0x92059238078caD43e18299BdcE944029D7A03A32";

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = "https://json-rpc.testnet.swisstronik.com/"; //URL of the RPC node for Swisstronik.
  const [encryptedData] = await encryptDataField(rpclink, data);
  console.log(signer);
  try {
    return await signer.sendTransaction({
      from: signer.address,
      to: destination,
      data: encryptedData,
      value,
    });
  } catch (error) {
    console.error(
      "There was a problem with the transaction. Try doing the transaction again.",
      error
    );
  }
};

function App() {
  const [fridgeId, setFridgeId] = useState(0);
  const [tech_review, setReview] = useState("");
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

  const submitFridgeData = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          myContractAddress,
          FridgeIPFS.abi,
          provider
        );

        const functionName = "saveDataBatch";
        const dataToSend = [
          {
            fridge_id: fridgeId,
            uploader: signer.address,
            ipfsHash: tech_review, //"En la revisión se ha cambiado el condensador. Fecha: 12/12/2023."
          },
        ];

        const setMessageTx = await sendShieldedTransaction(
          signer,
          myContractAddress,
          contract.interface.encodeFunctionData(functionName, [dataToSend]),
          0
        );
        await setMessageTx.wait();
      }
    } catch (error) {
      console.error(
        "There was a problem with the transaction. Try doing the transaction again.",
        error
      );
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
          <h1>Fridge Data Dapp (Technicians)</h1>
          <h2>Your Fridge, Your Data: Monitor with Confidence</h2>
        </div>
        <div className="input-field">
          <input
            type="number"
            min="0"
            placeholder="Fridge Id"
            onChange={(e) => {
              let value = e.target.value;
              if (value < 0) {
                value = 0;
              }
              setFridgeId(value);
            }}
            className="input-field"
          />
        </div>
        <div className="input-field">
          <input
            type="text"
            placeholder="Technical Information"
            onChange={(e) => {
              let value = e.target.value;
              setReview(value);
            }}
            className="input-field"
          />
        </div>
        <button
          onClick={() => {
            try {
              submitFridgeData();
            } catch (error) {
              alert(
                "There was a problem with the transaction. Try doing the transaction again."
              );
            }
          }}
          className="button"
        >
          Submit Data to the Blockchain
        </button>
      </div>
    </div>
  );
}

export default App;
