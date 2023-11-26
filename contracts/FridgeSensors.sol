// SPDX-License-Identifier: MIT LICENSE

pragma solidity 0.8.19;

contract myFridge {
    struct SensorData {
        uint256 timestamp;
        uint256 temperature;
        uint256 humidity;
    }

    struct Data {
        uint256 fridge_id;
        uint256 temperature;
        uint256 humidity;
    }

    mapping(uint256 => SensorData[]) public fridges;

    function saveData(
        uint256 fridge_id,
        uint256 _temperature,
        uint256 _humidity
    ) external {
        SensorData memory newData;
        newData.timestamp = block.timestamp;
        newData.temperature = _temperature;
        newData.humidity = _humidity;

        fridges[fridge_id].push(newData);
    }

    function saveDataBatch(Data[] calldata data) external {
        for (uint256 i = 0; i < data.length; i++) {
            SensorData memory newData;
            newData.timestamp = block.timestamp;
            newData.temperature = data[i].temperature;
            newData.humidity = data[i].humidity;

            fridges[data[i].fridge_id].push(newData);
        }
    }

    function getAllData(
        uint256 fridge_id
    ) external view returns (SensorData[] memory) {
        return fridges[fridge_id];
    }
}