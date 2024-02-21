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
  const contractAddress = "0x035c35f4cC4806Cc3FEbB16c0843eFfF761BbdC7";
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("FridgeIPFS");
  const contract = contractFactory.attach(contractAddress);
  const functionName = "getAllData";
  const idToSet = "29";

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
    const ipfsHash = data.ipfsHash;
    console.log("ipfsHash:", [ipfsHash]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
