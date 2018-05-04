//This module help to listen request
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('express-cors');
// app.use(bodyParser.json());
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

web3.setProvider(new web3.providers.HttpProvider("https://rinkeby.infura.io/t2utzUdkSyp5DgSxasQX"));

var abi = [{"constant":true,"inputs":[],"name":"isActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dests","type":"address[]"},{"name":"value","type":"uint256"}],"name":"sendTokensSingleValue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokensAvailable","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dests","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"sendTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"TransferredToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"FailedTransfer","type":"event"}];
var contractAddress = "0x7728e60cD3e4E983B3d4a0fdB5fF6cD1Cab9a7aB"; 
var contract =  web3.eth.contract(abi).at(contractAddress);

var sendToken = express.Router();
sendToken.post('/', async function(request, response){

    response.contentType('application/json');

    fromAddress = request.body.fromAddress;// "0x04Eed08C4200cdf514A9b079CF669B7172e71dfA";
    privateKey = request.body.privateKey; //"7454b931e4e41530d9c6b316d2db4c1a9f26173a8f3971553da23f29fe9b01b4";
    toAddress = request.body.address;
    tokenValue = request.body.tokens;



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
        "chainId": 0x04
    };
    var privKey = new Buffer(privateKey, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err){
            // response.write(hash);
            response.send = hash;
            console.log(hash);
            // response.contentType('application/json');
            response.end(JSON.stringify(hash));
        }
        else{
            console.log(err);
            response.end(JSON.stringify(err));

        }
    });
});
app.use('/transferToken', sendToken);


// var createAccount = express.Router();
// createAccount.get('/', function(request, response){
//     // Enter your infura key
//     var account = new Web3EthAccounts('http://mainnet.infura.io/t2utzUdkSyp5DgSxasQX');

//     response.contentType('application/json');
//     response.end(JSON.stringify(account.create()));
// });
// app.use('/create', createAccount);


// var getBalance = express.Router();
// getBalance.post('/', function(request , response){

//     var toAddress = request.body.toAddress;
//     response.contentType('application/json');
//     response.end(JSON.stringify(contract.balanceOf(toAddress)));

// });
// app.use('/balance', getBalance);



// var sendEther = express.Router();
// sendEther.post('/', async function(request, response){
    
    
//     fromAddress = request.body.from_address;
//     privateKey = request.body.from_private_key;
//     toAddress = request.body.to_address;
//     etherValue = request.body.ether_value;

//     etherValue = web3.toWei(etherValue, 'ether');

//     web3.eth.defaultAccount = fromAddress;
//     var count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
//     var gasPrice = web3.eth.gasPrice;
//     var gasLimit = 21000;
//     var rawTransaction = {
//         "from": fromAddress,
//         "nonce": web3.toHex(count),
//         "gasPrice": web3.toHex(gasPrice),
//         "gasLimit": web3.toHex(gasLimit),
//         "to": toAddress,
//         "value": web3.toHex(etherValue),
//         "chainId": 0x01
//     };
//     var privKey = new Buffer(privateKey, 'hex');
//     var tx = new Tx(rawTransaction);

//     tx.sign(privKey);
//     var serializedTx = tx.serialize();

//     web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
//         if (!err){
//             console.log(hash);
//             response.contentType('application/json');
//             response.end(JSON.stringify(hash));
//         }
//         else{
//             console.log(err);
//         }
//     });
// });
// app.use('/transferEther', sendEther);


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
