// Vercel serverless function wrapper for Express app
const path = require('path');
const serverPath = path.join(__dirname, '../dist/index.cjs');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    // Dynamically import the built server
    handler = require(serverPath);
  }
  
  return handler(req, res);
};
