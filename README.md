컴파운드 프로토콜과 상호작용할 수 있는 API 개발 프로젝트 입니다.

로컬 테스트넷 환경을 설정해주는 hardhat-project 부분과 API server 부분으로 나누어져 있습니다.

##  실행 방법
```bash
## Runs the Hardhat node locally
## Also seeds your first mnemonic account with test Ether and ERC20s
node ./scripts/run-localhost-fork.js

## Run API Server
node ./server.js
```

##  API 요청 및 응답
| 용도 | path | request body example | response (success) example [STATUS : 200] | response (fail) example |
| --- | --- | --- | --- | --- |
| 나의 잔고 확인 | /mybalance |  | {"message": "get my balance successfully","result": {"ETH_Balance": 9995,"cETH_Balance":"209.08922496","DAI_Balance":"97.000200882723749888","cDAI_Balance": "134.48363153"}} | [500] {"error": "Failed to execute contract function"} |
| 특정 계정 잔고 확인 | /balance | {"walletAddress" : "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"} | {"message": "get balance of 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B successfully","result": {"ETH_Balance": 49,"cETH_Balance": "0.0","DAI_Balance": "2.11218825","cDAI_Balance": "0.0"}
} | [400] { "error": "올바른 이더리움 주소값이 아닙니다" } [500] {"error": "Failed to execute contract function"} | 
| cErc20 ↔ Erc20 교환 비율 조회 | /cErc20ExchangeRate |  | { "message": "Current exchange rate from cDAI to DAI: 0.02230754" } | [500] { "error": "Failed to call exchangeRateCurrent function" } |
| cEth ↔ Eth 교환 비율 조회 | /cEthExchangeRate |  | { "message": "Current exchange rate from cETH to Eth: 0.02008711" } | [500] { "error": "Failed to call exchangeRateCurrent function" } |
| 유동성 조회 | /myLiquidity |  | { "message": "the account(0xa0df350d2637096571F7A701CBc1C5fdE30dF76A) has 0.134849053179356108 of LIQUID assets (worth of USD) pooled in the protocol." } | [500] { "error": "Failed to execute get liquidity function” } |
| 담보비율 (collateral factor) 조회 | /myCollateralFactor | { "cTokenAddress" : "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5" } | { "message": "can borrow up to 82.5% of your TOTAL collateral" } | [400] { "error": "올바른 이더리움 주소값이 아닙니다" } [500] { "error": "Failed to execute get collateralFactor function" } |
| 현재 가격 조회 | /price | { "assetSymbol" : "DAI" } | { "message": "1 DAI == 1.000379 USD" } | [500] { "error": "Failed to execute get price function" } |
| 현재 대출 이자율 조회 (ETH) | /borrowRate/Eth |  | { "message": "Your borrowed amount INCREASES (0.000000010316650957 * borrowed amount) ETH per block. \n This is based on the current borrow rate." } | [500] { "error": "Failed to execute get borrowRate function" } |
| 현재 대출 이자율 조회 (DAI) | /borrowRate/Erc20 |  | { "message": "\nYour borrowed amount INCREASES (0.00000001646490748 * borrowed amount) DAI per block.\nThis is based on the current borrow rate." } | [500] {"error": "Failed to execute get borrowRate function"} |
| 내가 빌린 ETH + 이자 조회 | /borrowBalance/Eth |  | {"message": "Borrow balance is 0.500000005158404847 ETH”} | [500] {"error": "Failed to execute get borrowBalance function"} |
| 내가 빌린 DAI + 이자 조회 | /borrowBalance/Erc20 |  | { "message": "Borrow balance is 3.0 DAI" } | [500] {"error": "Failed to execute get borrowBalance function"} |
