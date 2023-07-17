const ethers = require('ethers');
const checkInput = (res, input, decimal) => {
  try {
    if (typeof(decimal) == "Number") {
      return(BigInt(input * Math.pow(10, decimal)));
    } else {
      return(BigInt(input * Math.pow(10, ethers.toNumber(decimal))));
    }
   
  } catch {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }
}

const checkAddress = (res, address) => {
  try {
    ethers.getAddress(address);
  } catch (error) {
    return res.status(400).json({ error: '올바른 이더리움 주소값이 아닙니다' });
  }
}


module.exports = {checkInput, checkAddress};