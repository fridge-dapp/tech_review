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
        />
        <button onClick={() => fetchFridgeData()}>
          Fetch the Fridge's Sensors History
        </button>
        {buttonClicked && Object.keys(fridgeData).length === 0 ? (
          <p>This fridge has no data submitted yet.</p>
        ) : (
          Object.entries(fridgeData).map(([date, data], index) => (
            <div key={index}>
              <h2>Date: {date}</h2>
              {data.map((item, index) => (
                <div key={index} className="item-container">
                  <p>Temperature: {item.temperature}</p>
                  <p>Humidity: {item.humidity}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
