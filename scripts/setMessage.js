const hre = require("hardhat");
const fs = require("fs");
const {
  encryptDataField,
  decryptNodeResponse,
} = require("@swisstronik/swisstronik.js");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x5F5A6bEeACeb44A13e609d396385033f458d45c5";
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("myFridge");
  const contract = contractFactory.attach(contractAddress);
  const functionName = "saveDataBatch";

  // Read data from JSON file
  const data = fs.readFileSync("./data.json", "utf8");
  const jsonData = JSON.parse(data);

  // Prepare the array of data to be sent
  const dataToSend = jsonData.data.map((item) => {
    return {
      fridge_id: parseInt(item.idToSet),
      temperature: parseInt(item.temperatureToSet),
      humidity: parseInt(item.humidityToSet),
    };
  });

  const setMessageTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [dataToSend]),
    0
  );
  await setMessageTx.wait();
  console.log("Transaction Receipt: ", setMessageTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
