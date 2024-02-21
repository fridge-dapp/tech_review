import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FridgeIPFS from "./artifacts/contracts/Fridge.sol/Fridge.json";
import { encryptDataField } from "@swisstronik/swisstronik.js";

const myContractAddress = "0xd03a62F1A0Fff7E1d14d8c147129F0f605661b80";

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = "https://json-rpc.testnet.swisstronik.com/";
  const [encryptedData] = await encryptDataField(rpclink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
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
            timestamp: Math.floor(new Date().getTime() / 1000),
            uploader: signer.address,
            ipfsHash: tech_review,
            txHash: "Filler hash for the first transaction",
          },
        ];

        let int = contract.interface.encodeFunctionData(functionName, [
          dataToSend,
        ]);

        const setMessageTx = await sendShieldedTransaction(
          signer,
          myContractAddress,
          int,
          0
        );
        await setMessageTx.wait();

        const dataToSendTxHash = [
          {
            fridge_id: fridgeId,
            timestamp: Math.floor(new Date().getTime() / 1000),
            uploader: signer.address,
            ipfsHash: tech_review,
            txHash: setMessageTx.hash,
          },
        ];

        const setMessageTxHash = await sendShieldedTransaction(
          signer,
          myContractAddress,
          contract.interface.encodeFunctionData(functionName, [
            dataToSendTxHash,
          ]),
          0
        );
        await setMessageTxHash.wait();
      }
    } catch (error) {
      console.error("Error submitting fridge data:", error);
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
        <button onClick={() => submitFridgeData()} className="button">
          Submit Data to the Blockchain
        </button>
      </div>
    </div>
  );
}

export default App;
