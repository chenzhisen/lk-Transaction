var request = require('request');

var lk = {
    from: "yourAccount",
    to: "0x492c4186c37549ab76599188bcf6aa8c82388888",
    pwd: "ltk100.vip",
    gasPrice: '0x174876e800',

    //1.获取交易次数
    eth_getTransactionCount: function (account) {
        return ajax({
            "jsonrpc": "2.0",
            "id": "0",
            "method": "eth_getTransactionCount",
            "params": [account, "latest"]
        })
    },

    //2.预估gas
    eth_estimateGas: function (from, to, value) {
        return ajax({
            "jsonrpc": "2.0",
            "id": "0",
            "method": "eth_estimateGas",
            "params": [{
                "from": from,
                "to": to,
                "value": value
            }]
        })
    },
    //3.解锁账户
    personal_unlockAccount: function (from) {
        return ajax({
            "jsonrpc": "2.0",
            "method": "personal_unlockAccount",
            "params": [from, this.pwd, 3600],
            "id": 67
        })
    },
    //4.签名
    eth_signTransaction: async function (from, to, value) {

        var gas = await this.eth_estimateGas(from, to, value)
        console.log("gas", gas.result)
        var nonce = await this.eth_getTransactionCount(from)

        return ajax({
            "jsonrpc": "2.0",
            "id": "0",
            "method": "eth_signTransaction",
            "params": [{
                "from": from,
                "to": to,
                "gas": gas.result,
                "gasPrice": this.gasPrice,
                "value": value,
                "nonce": nonce.result
            }]
        })
    },
    //5.发送签名进行转账
    personal_sendTransaction: async function (from, to, value) {
        await this.personal_unlockAccount(from);
        var result = await this.eth_signTransaction(from, to, value);

        return ajax({
            "jsonrpc": "2.0",
            "id": "0",
            "method": "personal_sendTransaction",
            "params": [{
                "from": from,
                "to": to,
                "value": value
            }, this.pwd]
        })
    }
}


async function test() {
    // 转账
    lk.personal_sendTransaction(lk.from, lk.to, '0x1')
}

test()

//请求方法封装
function ajax(data) {

    return new Promise(function (resolve, reject) {

        request.post(
            {
                headers: {
                    "content-type": "application/json",
                },
                url: 'http://127.0.0.1:16000',
                body: JSON.stringify(data),

            },
            function (error, response, body) {

                if (response.statusCode == 200) {

                    console.log("方法：", data.method);
                    console.log("参数：", JSON.stringify(data));
                    console.log("返回：", body);

                    resolve(JSON.parse(body));

                } else {
                    reject(err);
                }
            }
        );
    });

}

