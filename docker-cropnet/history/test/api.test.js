const request = require('request');
const assert = require('assert');
const axios = require('axios');

var requestData = {
    "page": 1,
    "pageSize": 10,
    "queryParams": {},
    "sortParams": { _id: -1 }
}
describe('block', () => {
    it("list",() => {
        axios.post('http://127.0.0.1:3000/blocks', requestData)
          .then(function (response) {
            console.log(response);
            assert.ok(response.status == 200);
          })
          .catch(function (error) {
            console.log(error);
          });
    });

    it("getBlocksBycontract",() => {
        axios.post('http://127.0.0.1:3000/blocks/contract', {
            "block_num": 16000,
            "account": "ben",
            "contract": "ben",
            "contract_method": "hi_it_is_a_long_func"
        })
          .then(function (response) {
            console.log(response);
            assert.ok(response.status == 200);
          })
          .catch(function (error) {
            console.log(error);
          });
    });
})

describe('accounts', () =>{
    it("list",() => {
        request({
            url: "http://127.0.0.1:3000/accounts",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })
})

describe('contracts', () =>{
    it("list",() => {
        request({
            url: "http://127.0.0.1:3000/contracts",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })

    it("by name", () => {
        request({
            url: "http://127.0.0.1:3000/contracts/ultrainio",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })
})

describe('txs', () =>{
    it("list",() => {
        request({
            url: "http://127.0.0.1:3000/txs",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })

    it("tx by id",() => {
        request({
            url: "http://127.0.0.1:3000/txs/965cfe08b6e39944da0468acd029c7c2f78b97ad8a00d71120b2048807f19aaa",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: ""
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })

    it("tx by block_num",async () => {
        requestData.queryParams = {}
        await request({
            url: "http://127.0.0.1:3001/txs/by/blocknum",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })
})

describe('actions', () =>{
    it("actions by tx_id", ()=>{
        request({
            url: "http://127.0.0.1:3000/actions/tx/ba567649100ce098120f9b2209f61aaf3325e1b9ce3fabd8f81fb74cc992fdaa",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: ""
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })

    it("actions by account", ()=>{
        requestData.queryParams = {account_name:"ot112"}
        request({
            url: "http://127.0.0.1:3000/actions/by/account",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })

    it("getCreateAccountByName", async ()=>{
        request({
            url: "http://127.0.0.1:3000/getcreateaccount",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({name:"ot112"})
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })
})


describe('search', () =>{
    it("search",() => {
        request({
            url: "http://127.0.0.1:3000/search/test1",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestData)
        }, function(error, response, body) {
            console.log(body);
            assert.ok(response.statusCode == 200);
        });
    })
})