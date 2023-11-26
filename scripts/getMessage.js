const hre = require("hardhat");
const {
  encryptDataField,
  decryptNodeResponse,
} = require("@swisstronik/swisstronik.js");

const sendShieldedQuery = async (provider, destination, data) => {
  const rpclink = hre.network.config.url;
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

async function main() {
  const contractAddress = "0x5F5A6bEeACeb44A13e609d396385033f458d45c5";
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("myFridge");
  const contract = contractFactory.attach(contractAddress);
  const functionName = "getAllData";
  const idToSet = "2";

  // Encode the function call
  const functionCallData = contract.interface.encodeFunctionData(functionName, [
    idToSet,
  ]);

  // Send the shielded query
  const responseMessage = await sendShieldedQuery(
    signer.provider,
    contractAddress,
    functionCallData
  );

  // Decode the response
  const decodedResponse = contract.interface.decodeFunctionResult(
    functionName,
    responseMessage
  );

  // Iterate through the array of SensorData
  for (const data of decodedResponse[0]) {
    const temperature = Number(data.temperature);
    const humidity = Number(data.humidity);
    console.log("Temperature, humidity:", [temperature, humidity]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
