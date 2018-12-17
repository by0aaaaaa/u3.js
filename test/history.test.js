
const assert = require('assert');
const { U3 } = require('../index');
const u3Instance = U3.createU3({
    httpEndpoint_history: 'http://127.0.0.1:3001'
});

describe('history', async () => {

    it("getAllBlocks", async () => {
        const rs = await u3Instance.getAllBlocks(1, 10, { "block.proposer": "genesis" }, { _id: -1 });
        assert.ok(rs);
    });

    it("getContracts", async () => {
        const rs = await u3Instance.getContracts(1, 10, {}, { _id: -1 });
        assert.ok(rs);
    });

    it("getContractByName", async () => {
        const rs = await u3Instance.getContractByName("ultrainio");
        assert.ok(rs);
    });

    it("getAllAccounts", async () => {
        const rs = await u3Instance.getAllAccounts(1, 10, {}, { _id: -1 });
        assert.ok(rs);
    });

    it("getAllTxs", async () => {
        const rs = await u3Instance.getAllTxs(1, 10, {}, { _id: -1 });
        assert.ok(rs);
    });

    it("getTxByTxId", async () => {
        const txs = await u3Instance.getAllTxs(1, 1, {}, { _id: -1 });
        const rs = await u3Instance.getTxByTxId(txs.results[0].trx_id);
        assert.ok(rs);
    });

    it("getActionsByTxid", async () => {
        const txs = await u3Instance.getAllTxs(1, 1, {}, { _id: -1 });
        const rs = await u3Instance.getActionsByTxid(txs.results[0].trx_id);
        assert.ok(rs);
    });

    it("getActionsByAccount", async () => {
        var requestData = {
            "page": 1,
            "pageSize": 10,
            "queryParams": { account_name: "ultrainio" },
            "sortParams": { _id: -1 }
        }
        const rs = await u3Instance.getActionsByAccount(requestData.page, requestData.pageSize, requestData.queryParams, requestData.sortParams);
        assert.ok(rs);
    });

    it("getTxsByBlockNum", async () => {
        const blocks = await u3Instance.getAllBlocks(1, 1, {}, { _id: -1 });
        var requestData = {
            "page": 1,
            "pageSize": 10,
            "queryParams": { block_num: blocks.results[0].block_num },
            "sortParams": { _id: -1 }
        }
        const rs = await u3Instance.getTxsByBlockNum(requestData.page, requestData.pageSize, requestData.queryParams, requestData.sortParams);
        assert.ok(rs);
    });

    it("getBlocksByContract", async () => {
        const rs = await u3Instance.getBlocksByContract(1, "ultrainio", "utrio.token", "transfer");
        assert.ok(rs);
    });

    it("getTxTraceByTxid", async () => {
        const txs = await u3Instance.getAllTxs(1, 1, {}, { _id: -1 });
        const rs = await u3Instance.getTxTraceByTxid(txs.results[0].trx_id);
        assert.ok(rs);
    });

    it("search by block_num", async () => {
        const blocks = await u3Instance.getAllBlocks(1, 1, {}, { _id: -1 });
        let block_num = blocks.results[0].block_num;
        let rs = await u3Instance.search(block_num);
        assert.ok(rs);
    })

    it("search by trx_id", async () => {
        let txs = await u3Instance.getAllTxs(1, 1, {}, { _id: -1 });
        let trx_id = txs.results[0].trx_id;
        let rs = await u3Instance.search(trx_id);
        assert.ok(rs);
    })

    it("search by account", async () => {
        let account = "jack";
        let rs = await u3Instance.search(account);
        assert.ok(rs);
    })

    it("getCreateAccountByName", async () => {
        let account = "ot112";
        let rs = await u3Instance.getCreateAccountByName(account);
        assert.ok(rs);
    })

    it("getAllTokens", async () => {
        let rs = await u3Instance.getAllTokens(1, 1, {}, { _id: -1 });
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getTokenBySymbol", async () => {
        let rs = await u3Instance.getTokenBySymbol("ZTPJ", "ben");
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getBaseInfo", async () => {
        let rs = await u3Instance.getBaseInfo();
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getBalanceByAccount", async () => {
        let rs = await u3Instance.getBalanceByAccount("ben");
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getHoldersBySymbol", async () => {
        let rs = await u3Instance.getHoldersBySymbol(1, 10, { token_account: "ben", token_symbol: "BJMZ" }, { current_balance: -1 });
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getAllBlocksHeader", async () => {
        let rs = await u3Instance.getAllBlocksHeader(1, 1, {}, { _id: -1 });
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })

    it("getProposerList", async () => {
        let rs = await u3Instance.getProposerList(1, 1, { owner: "user.141" });
        console.log(JSON.stringify(rs, null, 2));
        assert.ok(rs);
    })
})