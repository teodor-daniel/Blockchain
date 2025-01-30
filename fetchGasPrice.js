require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const ETHERSCAN_API_URL = `https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=2000000000&apikey=${ETHERSCAN_API_KEY}`;

(async () => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL);

    const gasPrice = response.data.result;

    fs.writeFileSync("gasPrice.txt", `Gas Price: ${gasPrice} wei\n`, "utf-8");

    console.log("Gas price saved to gasPrice.txt");
  } catch (error) {
    console.error("Error fetching gas price:", error.message);
  }
})();
