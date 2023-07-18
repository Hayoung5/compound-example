이더리움 기반 DeFi 프로토콜 중 하나인 컴파운드(Compound) 프로토콜과 상호작용하는 API 개발 프로젝트 입니다.

로컬 테스트넷 환경을 설정해주는 hardhat-project 부분과 API server 부분으로 나누어져 있습니다.

<br>

##  실행 방법
테스트넷을 실행하기 위해 hardhat-project 내에서 아래와 같은 명령어를 입력하세요.
```bash
## Runs the Hardhat node locally (Fork mainnet)
## Also seeds your first mnemonic account with test Ether and ERC20s
node ./scripts/run-localhost-fork.js
```
올바르게 실행된 경우 터미널에 아래와 같은 출력이 나타납니다.

<br>

API 서버를 실행하기 위해 새로운 터미널을 열고 API-server 내에서 아래와 같은 명령어를 입력하세요.
```bash
## Run API Server
node ./server.js
```
올바르게 실행된 경우 터미널에 아래와 같은 출력이 나타납니다.

<br>

##  API 요청 및 응답

### GET 요청 및 응답 예시
| 용도 | path | request body example | response (success) example [STATUS : 200] | response (fail) example |
| --- | --- | --- | --- | --- |
| 나의 잔고 확인 | /mybalance |  | {"message": "get my balance successfully", <br> "result": {"ETH_Balance": 9995,<br>"cETH_Balance":"209.08922496",<br>"DAI_Balance":"97.000200882723749888",<br>"cDAI_Balance": "134.48363153"}} | [500] <br> {"error": "Failed to execute contract function"} |
| 특정 계정 잔고 확인 | /balance | {"walletAddress" : "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"} | {"message": "get balance of 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B successfully", <br> "result": {"ETH_Balance": 49,<br>"cETH_Balance": "0.0",<br>"DAI_Balance": "2.11218825",<br>"cDAI_Balance": "0.0"}} | [400] <br> { "error": "올바른 이더리움 주소값이 아닙니다" } <br> [500] <br> {"error": "Failed to execute contract function"} | 
| cErc20 ↔ Erc20 교환 비율 조회 | /cErc20ExchangeRate |  | { "message": "Current exchange rate from cDAI to DAI: 0.02230754" } | [500] <br> { "error": "Failed to call exchangeRateCurrent function" } |
| cEth ↔ Eth 교환 비율 조회 | /cEthExchangeRate |  | { "message": "Current exchange rate from cETH to Eth: 0.02008711" } | [500] <br> { "error": "Failed to call exchangeRateCurrent function" } |
| 유동성 조회 | /myLiquidity |  | { "message": "the account(0xa0...) has 0.134849053179356108 of LIQUID assets (worth of USD) pooled in the protocol." } | [500] <br> { "error": "Failed to execute get liquidity function” } |
| 담보비율 (collateral factor) 조회 | /myCollateralFactor | { "cTokenAddress" : "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5" } | { "message": "can borrow up to 82.5% of your TOTAL collateral" } | [400] <br> { "error": "올바른 이더리움 주소값이 아닙니다" } <br> [500] <br> { "error": "Failed to execute get collateralFactor function" } |
| 현재 가격 조회 | /price | { "assetSymbol" : "DAI" } | { "message": "1 DAI == 1.000379 USD" } | [500] <br> { "error": "Failed to execute get price function" } |
| 현재 대출 이자율 조회 (ETH) | /borrowRate/Eth |  | { "message": "Your borrowed amount INCREASES (0.000000010316650957 * borrowed amount) ETH per block. <br> This is based on the current borrow rate." } | [500] <br> { "error": "Failed to execute get borrowRate function" } |
| 현재 대출 이자율 조회 (DAI) | /borrowRate/Erc20 |  | { "message": "\nYour borrowed amount INCREASES (0.00000001646490748 * borrowed amount) DAI per block. <br> This is based on the current borrow rate." } | [500] <br> {"error": "Failed to execute get borrowRate function"} |
| 내가 빌린 ETH + 이자 조회 | /borrowBalance/Eth |  | {"message": "Borrow balance is 0.500000005158404847 ETH”} | [500] <br> {"error": "Failed to execute get borrowBalance function"} |
| 내가 빌린 DAI + 이자 조회 | /borrowBalance/Erc20 |  | { "message": "Borrow balance is 3.0 DAI" } | [500] <br> {"error": "Failed to execute get borrowBalance function"} |

<br>

### POST 요청 및 응답 예시
| 용도 | path | request body example | response (success) example [STATUS : 200] | response (fail) example |
| --- | --- | --- | --- | --- |
| ETH 예치 | /supply/eth | { "supplyAmount" : "3" } | {"message": "supply 3 ETH successfully", "mint": {…}} | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: insufficient ETH, my wallet balance : ${walletEthBalance}, supply amount you requested } <br> [500] <br> { "error": "Failed to execute supply ETH function" } |
| Erc20 예치 | /supply/erc20 | { "supplyAmount" : "1.8" } | { "message": "supply 1 DAI successfully", "mint": {…} } | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: "can't approve ERC20 token” } <br> [500] <br> { "error": "Failed to execute supply DAI function" } |
| cETH 상환 | /redeemCEth/cToken | {"redeemAmount" : "1.5"} | { "message": "redeem 1.5 cETH successfully", "redeem": {…} } | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: … } |
| cETH 상환 (돌려받을 ETH양 기준으로) | /redeemCEth/underlying | {"redeemAmount" : "1.5"} | { "message": "redeem cETH based on 1.5 ETH successfully", "redeem": {…} } | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: EVM error message } |
| cDAI 상환 | /redeemCErc20/cToken | {"redeemAmount" : "60"} | { "message": "redeem 60 cDAI successfully", "redeem": {…} } | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: EVM error message } |
| cDAI 상환 (돌려받을 DAI양 기준으로) | /redeemCErc20/underlying | {"redeemAmount" : "1.5"} | { "message": "redeem cDAI based on 1.5 DAI successfully", "redeem": {…} } | [400] <br> { error: '올바른 형식의 입력값이 아닙니다’ } <br> [402] <br> { error: EVM error message } |
| 대출을 위한 마켓 진입 | /borrow/enterMarket | {"cTokenAddress" : "0x5d3..."} | { "message": "enter the market successfully", "enterMarkets": {…} } | [400] <br> { "error": "올바른 이더리움 주소값이 아닙니다" } <br> [500] <br> { "error": "Failed to execute enter market function" } |
| 이더 대출 | borrow/Eth | {"borrowAmount" : "0.5"} | { "message": "0.5 ETH borrow successful." } | [500] <br> { "error": EVM error message } |
| DAI 토큰 대출 | borrow/Erc20 | {"borrowAmount" : "3"} | {"message": "3 DAI borrow successful."} | [400] <br> {error: '올바른 형식의 입력값이 아닙니다’} <br> [500] <br> {"error": EVM error message} |
| 대출 받았던 ETH 상환 (repay) | /repay/Eth | {"repayAmount" : "0.1"} | "message": "0.1 ETH repay successful."} | [500] <br> {"error": EVM error message} |
| 대출 받았던 ETH 상환 (repay) | /repay/Erc20 | {"repayAmount" : "3"} | {"message": "3 DAI repay successful."} | [400] <br> {error: '올바른 형식의 입력값이 아닙니다’} <br> [500] <br> {"error": EVM error message} |

