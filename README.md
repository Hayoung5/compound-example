이더리움 기반 DeFi 프로토콜 중 하나인 컴파운드(Compound) 프로토콜과 상호작용하는 API 개발 프로젝트 입니다.

이더리움 메인넷을 포크하여 로컬 테스트넷 환경을 설정해주는 hardhat-project 부분과 컴파운드 프로토콜과 상호작용하는 API server 부분으로 나누어져 있습니다.

Compound V2를 지원하며, Ether js v6를 사용합니다.

#### 폴더 구조


```bash
.
├── API-server
│   ├── contracts.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── access.log                    // 로그 파일
│   ├── server.js                     // 서버 실행 스크립트
│   └── api
│       ├── controllers
│       │   ├── borrowController.js   // 마켓 진입, 대출, 대출 상환 등의 요청을 처리
│       │   └── supplyController.js   // 예치, 예치 출금 등의 요청을 처리
│       ├── routes
│       │   └── userRoutes.js         // route path 정의
│       └── utils              
│           ├── constants.js
│           ├── contracts.js
│           └── helper.js
│
├── README.md
└── hardhat-project
    ├── README.md
    ├── contracts
    ├── contracts.json
    ├── hardhat.config.js             // 하드햇 네트워크 설정
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── scripts
    │   ├── deploy.js
    │   └── run-localhost-fork.js      // 메인넷 포크 테스크 및 계정 사칭
    └── test
```

<br>

## Compound protocol
### Compound protocol 소개

<br>

컴파운드는 자산의 유동성을 제공하고, 대출과 예치를 통해 사용자들에게 금융 기회를 제공하는 DeFi 프로토콜입니다.

1. 예치: 사용자는 자산을 컴파운드에 예치할 수 있습니다. 이 자산은 다른 사용자들에게 대출해주는 데 사용됩니다.

2. 대출: 예치한 자산의 대부분은 다른 사용자에게 대출됩니다. 대출을 받기 위해서는 적절한 담보를 제공해야 합니다.

3. 이자: 대출을 받은 사용자는 대출 이자를 지불해야 합니다. 대출 이자는 예치한 자산의 이자로부터 파생됩니다.

4. 유동성 공급: 사용자들의 예치와 대출 활동이 컴파운드 시스템에 유동성을 제공합니다. 이를 통해 다른 사용자들이 필요한 자금을 빌리고, 예치한 자산에 대한 이자를 얻을 수 있습니다.

5. 자동 조정: 컴파운드 프로토콜은 스마트 계약과 알고리즘을 사용하여 자동적으로 대출 금리와 예치 이자율을 조정합니다. 이는 시장의 수요와 공급에 따라 변동할 수 있습니다.

6. 컴파운드 토큰: 컴파운드 프로토콜에서는 자산을 대표하는 컴파운드 토큰을 발행합니다. 예를 들어, cETH는 예치한 이더를 대표하고, cDAI는 예치한 DAI를 대표합니다. 이 컴파운드 토큰은 사용자에게 예치한 자산에 대한 소유권 및 이자 지분을 나타냅니다.
   
<br>

### Commpound protocol 스마트 컨트랙트
#### cToken 컨트랙트 (cETH, cDAI 등):
cToken 컨트랙트는 예치한 자산을 대표하는 컴파운드 토큰을 발행합니다. 예를 들어, cETH는 예치한 이더를 대표하고, cDAI는 예치한 DAI를 대표합니다.

사용 가능한 메소드:

* mint: 특정 자산을 예치하여 cToken을 발행합니다.
* redeem: cToken을 소각하고 예치한 자산을 회수합니다.
* balanceOf: 특정 주소의 cToken 잔액을 조회합니다.
* borrow: 자산을 빌려오는 대출을 진행 합니다.
* borrowRatePerBlock: 블록 당 부과되는 대출 이자율을 조회합니다.
* borrowBalanceCurrent: 현재 대출 받은 자산과 이자를 합친 금액을 조회합니다.
* repayBorrow: 대출금을 상환합니다.

<br>

#### Comptroller 컨트랙트:
Comptroller 컨트랙트는 컴파운드 프로토콜의 핵심 기능을 관리하고 조정합니다.

사용 가능한 메소드:

* markets: 담보 비율을 조회합니다.
* enterMarkets: 특정 자산 시장에 참여하고, 사용자의 예치 자산을 활성화합니다.
* exitMarket: 특정 자산 시장에서 나와 사용자의 예치 자산을 비활성화합니다.
* getAccountLiquidity: 특정 주소의 계정 유동성 상태를 조회합니다.
* getAssetsIn: 특정 주소가 참여한 시장의 자산 목록을 조회합니다.

<br>

#### PriceFeed 컨트랙트:

PriceFeed 컨트랙트는 컴파운드에서 사용되는 자산의 가격 정보를 제공합니다.

사용 가능한 메소드:

* getUnderlyingPrice: 특정 자산의 현재 가격을 조회합니다.

<br>


## hardhat-project
run-localhost-fork.js을 실행하여 메인넷을 포크하여 로컬 테스트넷을 실행합니다.

또한, 하드햇의 계정 사칭(hardhat_impersonateAccount) 메소드를 사용하여, 테스트 계정에 예치에 사용할 자산을 부여합니다.

<br>

###  실행 방법
hardhat-project 내에서 .env_example 파일을 확인하고 Infura key를 발급받아 `ETHEREUM_PROVIDER_URL`을 작성하세요.

파일명을 .env로 변경한 후, 테스트넷을 실행하기 위해 hardhat-project 내에서 아래와 같은 명령어를 입력하세요.
```bash
## Install module, libaray
npm install
## Runs the Hardhat node locally (Fork mainnet)
## Also seeds your first mnemonic account with test Ether and ERC20s
node ./scripts/run-localhost-fork.js
```
올바르게 실행된 경우 터미널에 아래와 같은 출력이 나타납니다.

<br>

<img width="650" alt="스크린샷 2023-07-18 오후 3 02 14" src="https://github.com/Hayoung5/compound-example/assets/104472372/56b3dc23-a04a-4272-9c4a-2ec093677c88">

<br>

## hardhat-project
서버(http://localhost:3000/)로 들어온 요청을 수행하기 위해 하드햇 로컬 테스트넷을 통해 컴파운드 프로토콜과 상호작용합니다.

<br>

### 주의 사항
1. 테스트 계정 문제

    현재 코드는 서버에서 private key를 가지고 있는 테스트 계정(hardhat 실행시 ether, dai를 부여받은 계정)을 사용하여 트랜잭션에 자동 서명 합니다.

    이는 실제의 블록체인 상호작용 서버의 동작 원리와는 크게 다를 수 있음에 유의하세요.

2. Gas Fee 처리 문제

    이 코드는 이더가 풍부한 테스트 계정을 사용하여 Gas Fee를 구체적으로 지정하거나 제한하지지 않습니다.

    실무에서 가스비 절감은 큰 이슈이고, 가스비 추정 API 등을 사용하기도 합니다.

<br>

###  실행 방법

API 서버를 실행하기 위해 새로운 터미널을 열고 API-server 내에서 아래와 같은 명령어를 입력하세요.
```bash
## Install module, libaray
npm install
## Run API Server
node ./server.js
```
올바르게 실행된 경우 터미널에 아래와 같은 출력이 나타납니다.

<br>

<img width="506" alt="스크린샷 2023-07-18 오후 3 05 34" src="https://github.com/Hayoung5/compound-example/assets/104472372/cf71e835-1f4a-4f98-90c9-fd0bc9d2ee1e">

<br>


##  API 요청 및 응답

### GET 요청 및 응답 예시
| 용도 | path | request body example | response (success) example [STATUS : 200] | response (fail) example |
| --- | --- | --- | --- | --- |
| 나의 잔고 확인 | /mybalance |  | {"message": "get my balance successfully", <br> "result": {"ETH_Balance": 9995,<br>"cETH_Balance":"209.08922496",<br>"DAI_Balance":"97.000200882723749888",<br>"cDAI_Balance": "134.48363153"}} | [500] <br> {"error": "Failed to execute contract function"} |
| 특정 계정 잔고 확인 | /balance | {"walletAddress" : "0xAb58..."} | {"message": "get balance of 0xAb58... successfully", <br> "result": {"ETH_Balance": 49,<br>"cETH_Balance": "0.0",<br>"DAI_Balance": "2.11218825",<br>"cDAI_Balance": "0.0"}} | [400] <br> { "error": "올바른 이더리움 주소값이 아닙니다" } <br> [500] <br> {"error": "Failed to execute contract function"} | 
| cErc20 ↔ Erc20 교환 비율 조회 | /cErc20ExchangeRate |  | { "message": "Current exchange rate from cDAI to DAI: 0.02230754" } | [500] <br> { "error": "Failed to call exchangeRateCurrent function" } |
| cEth ↔ Eth 교환 비율 조회 | /cEthExchangeRate |  | { "message": "Current exchange rate from cETH to Eth: 0.02008711" } | [500] <br> { "error": "Failed to call exchangeRateCurrent function" } |
| 유동성 조회 | /myLiquidity |  | { "message": "the account(0xa0...) has 0.134849053179356108 of LIQUID assets (worth of USD) pooled in the protocol." } | [500] <br> { "error": "Failed to execute get liquidity function” } |
| 담보비율 (collateral factor) 조회 | /myCollateralFactor | { "cTokenAddress" : "0x4ddc..." } | { "message": "can borrow up to 82.5% of your TOTAL collateral" } | [400] <br> { "error": "올바른 이더리움 주소값이 아닙니다" } <br> [500] <br> { "error": "Failed to execute get collateralFactor function" } |
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

<br>

### References
https://medium.com/compound-finance/supplying-assets-to-the-compound-protocol-ec2cf5df5aa

https://medium.com/compound-finance/borrowing-assets-from-compound-quick-start-guide-f5e69af4b8f4

https://github.com/compound-developers/compound-supply-examples

https://github.com/compound-developers/compound-borrow-examples


