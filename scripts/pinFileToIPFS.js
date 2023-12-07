const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwYTJlMjhjMS0xZDZhLTRjYmMtOGNmMi02YzY1YjA4YWJkOTYiLCJlbWFpbCI6Im5pbmpoYWNrYXRob25AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRjNDlhNDcwZDU1NWI0ODdiYjY1Iiwic2NvcGVkS2V5U2VjcmV0IjoiMDE5M2E3MGVlZmU1NzdmOThiNTUwNzhjZWJkNzc4YjA1ZmZiNGQ1MjJjYzhiYTFkNTZiMzg2ZDE2YzIzMTMzYiIsImlhdCI6MTcwMTE4MjA4MH0.Fsj0QMbRGmf0Bd2yN58SbTwuhiKB7Da79bHZM4SNKUg";

const pinFileToIPFS = async () => {
  const formData = new FormData();
  const src = "./data.json";

  const file = fs.createReadStream(src);
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: "File name",
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    console.log(res.data);
    console.log(
      `View the file here: https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    );
  } catch (error) {
    console.log(error);
  }
};

pinFileToIPFS();
