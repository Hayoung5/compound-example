const checkInput = (input) => {
try {
    input = BigInt(input);
  } catch {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }
}

module.exports = {checkInput};