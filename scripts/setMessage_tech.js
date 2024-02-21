const hre = require("hardhat");
const fs = require("fs");
const {
  encryptDataField,
  decryptNodeResponse,
} = require("@swisstronik/swisstronik.js");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  console.log("SIGNER:", signer);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x92059238078caD43e18299BdcE944029D7A03A32";
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory(
    "FridgeIPFSOwner"
  );
  const contract = contractFactory.attach(contractAddress);
  const functionName = "saveDataBatch";

  const dataToSend = [
    {
      fridge_id: 23,
      uploader: signer.address, // New field to store the uploader's address
      ipfsHash: "Revision hecha por wallet 0c",
    },
  ];

  const setMessageTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [dataToSend]),
    0
  );
  await setMessageTx.wait();
  console.log("Transaction Receipt: ", setMessageTx);
  console.log("Transaction Hash: ", setMessageTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
