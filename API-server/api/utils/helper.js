const ethers = require('ethers');
const e = require('express');
const checkInput = (input, decimal) => {
  try {
    if (input != undefined) {
      if (typeof(decimal) == "Number") {
        return(BigInt(input * Math.pow(10, decimal)));
      } else {
        console.log(ethers.toNumber(decimal));
        console.log(BigInt(input * Math.pow(10, ethers.toNumber(decimal))));
        return(BigInt(input * Math.pow(10, ethers.toNumber(decimal))));
      }
    } else {
      throw new Error('올바른 형식의 입력값이 아닙니다');
    }
  } catch (error) {
    return false; // 입력값이 유효하지 않은 경우 false를 반환합니다.
  }
}

const checkAddress = (address) => {
  try {
    if (address != undefined) {
      ethers.getAddress(address);
    } else {
      throw new Error('올바른 이더리움 주소값이 아닙니다');
    }
  } catch (error) {
    return false; // 주소가 유효하지 않은 경우 false를 반환합니다.
  }
  return true; // 주소가 유효한 경우 true를 반환합니다.
};



module.exports = {checkInput, checkAddress};