// SPDX-License-Identifier: MIT LICENSE

pragma solidity 0.8.19;

contract FridgeIPFS {
    struct SensorData {
        uint256 timestamp;
        string ipfsHash;
    }

    struct Data {
        uint256 fridge_id;
        string ipfsHash;
    }

    mapping(uint256 => SensorData[]) public fridges;

    event DataSaved(uint256 indexed fridge_id, string ipfsHash);

    function saveData(
        uint256 fridge_id,
        string calldata _ipfsHash
    ) external {
        SensorData memory newData;
        newData.timestamp = block.timestamp;
        newData.ipfsHash = _ipfsHash;

        fridges[fridge_id].push(newData);
    }

    function saveDataBatch(Data[] calldata data) external {
        for (uint256 i = 0; i < data.length; i++) {
            SensorData memory newData;
            newData.timestamp = block.timestamp;
            newData.ipfsHash = data[i].ipfsHash;

            fridges[data[i].fridge_id].push(newData);

            emit DataSaved(data[i].fridge_id, data[i].ipfsHash);
        }
    }

    function getAllData(
        uint256 fridge_id
    ) external view returns (SensorData[] memory) {
        return fridges[fridge_id];
    }
}