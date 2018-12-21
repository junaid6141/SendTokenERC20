
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('express-cors');
var ethereum_address = require('ethereum-address');

app.use(bodyParser.json({type: 'application/json'}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var toAddress = '';
var fromAddress = '';
var ContractAddress = '';
var privateKey = '';
var tokenValue = '';

const Web3 = require("web3");
const web3 = new Web3();
const Tx = require("ethereumjs-tx");
var Web3EthAccounts = require('web3-eth-accounts');

web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/'Your Infura token'"));

var abi = "Token ABI";
var contractAddress = ""; 
var contract =  web3.eth.contract(abi).at(contractAddress);

var sendToken = express.Router();
sendToken.post('/', async function(request, response){

    response.contentType('application/json');

    fromAddress = request.body.fromAddress;
    privateKey = request.body.privateKey; 
    toAddress = request.body.address;
    tokenValue = request.body.tokens;
    
    maxLImit = toAddress.length;


    web3.eth.defaultAccount = fromAddress;
    var count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    var data = contract.sendTokens.getData(toAddress, tokenValue);
    var gasPrice = web3.eth.gasPrice;
    var gasLimit = 6000000;
    var rawTransaction = {
        "from": fromAddress,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": contractAddress,
        "data": data,
        "chainId": 0x01
    };
    var privKey = new Buffer(privateKey, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err){
            response.send = hash;
            response.end(JSON.stringify(hash));
        }
        else{
            response.end(JSON.stringify(err));

        }
    });
});
app.use('/transferToken', sendToken);

app.get('/', function(request, response){
    
    response.contentType('application/json');
    response.end(JSON.stringify("Node is running"));
});



if (module === require.main) {
    // Start the server
    var server = app.listen(process.env.PORT || 3000, function () {
        var port = server.address().port;
        console.log('App listening on port %s', port);
    });
}
module.exports = app;
