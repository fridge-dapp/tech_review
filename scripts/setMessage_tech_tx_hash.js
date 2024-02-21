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
  try {
    const contractAddress = "0xd03a62F1A0Fff7E1d14d8c147129F0f605661b80";
    const [signer] = await hre.ethers.getSigners();
    const contractFactory = await hre.ethers.getContractFactory("Fridge");
    const contract = contractFactory.attach(contractAddress);
    const functionName = "saveDataBatch";

    const dataToSend = [
      {
        fridge_id: 148,
        timestamp: Math.floor(new Date().getTime() / 1000),
        uploader: signer.address, // New field to store the uploader's address
        ipfsHash: "Revision hecha por wallet 0c",
        txHash: "Filler hash for the first transaction",
      },
    ];

    console.log("DATA:", dataToSend);

    const setMessageTx = await sendShieldedTransaction(
      signer,
      contractAddress,
      contract.interface.encodeFunctionData(functionName, [dataToSend]),
      0
    );
    await setMessageTx.wait();
    console.log("Transaction Receipt: ", setMessageTx);
    console.log("Transaction Hash: ", setMessageTx.hash);

    const dataToSendTxHash = [
      {
        fridge_id: 148,
        timestamp: Math.floor(new Date().getTime() / 1000),
        uploader: signer.address, // New field to store the uploader's address
        ipfsHash: "Revision hecha por wallet 0c",
        txHash: setMessageTx.hash,
      },
    ];

    console.log("DATA:", dataToSendTxHash);

    const setMessageTxHash = await sendShieldedTransaction(
      signer,
      contractAddress,
      contract.interface.encodeFunctionData(functionName, [dataToSendTxHash]),
      0
    );
    await setMessageTxHash.wait();
    console.log("Transaction Receipt: ", setMessageTxHash);
  } catch (error) {
    console.log("ERROR: ", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
