// 常量定义
const VIN_CONSTANTS = {
  // 车架号地区代码
  AREA_CODES: ['1', '2', '3', '6', '9', 'J', 'K', 'L', 'R', 'S', 'T', 'V', 'W', 'Y', 'Z', 'G'],

  // 车架号中可能出现的字符
  VALID_CHARS: ['1', '2', '3', '4', '5', '6', '7', '8', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y'],

  // 车架号校验位计算映射
  CHECK_DIGIT_MAP: [
    ['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8],
    ['I', 0], ['J', 1], ['K', 2], ['L', 3], ['M', 4], ['N', 5], ['O', 0], ['P', 7],
    ['Q', 8], ['R', 9], ['S', 2], ['T', 3], ['U', 4], ['V', 5], ['W', 6], ['X', 7],
    ['Y', 8], ['Z', 9]
  ],

  // 车架号数据加权数组
  WEIGHTS: [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2],

  // 生产年份代码
  YEAR_CODES: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y'],

  // 出厂顺序代码
  SEQUENCE_CODES: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y'],

// 世界制造商识别码
  WMI: ['LVS', 'LSV', 'LVH', 'LFP', 'LFV', 'JT1', 'JTH', 'JM1', 'JH4', '5YJ', '1G1', '1FA', 'WBA', 'WDB', 'WAU', 'WVW', 'VF1', 'ZFF', 'SAL', 'YV1']
}

class VinGenerator {
  constructor() {
    this.constants = VIN_CONSTANTS;
  }

  // 生成随机整数
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  // 从数组中随机获取一个元素
  getRandomElement(array) {
    return array[this.getRandomInt(array.length)];
  }

  // 生成前部分字符串
  generateBeforeStr() {
    const wmi = this.getRandomElement(this.constants.WMI);
    const chars = Array(5).fill(0).map(() => this.getRandomElement(this.constants.VALID_CHARS));
    return wmi + chars.join('');
  }

  // 生成后部分字符串
  generateAfterStr() {
    const yearCode = this.getRandomElement(this.constants.YEAR_CODES);
    const sequenceCodes = Array(3).fill(0).map(() => this.getRandomElement(this.constants.SEQUENCE_CODES));
    const sequenceNumbers = Array(4).fill(0).map(() => this.getRandomElement(this.constants.SEQUENCE_CODES));
    return yearCode + sequenceCodes.join('') + sequenceNumbers.join('');
  }

  // 计算校验位
  calculateCheckDigit(vin) {
    const chars = vin.split('');
    let sum = 0;

    for (let i = 0; i < 17; i++) {
      let value;
      const char = chars[i].toUpperCase();

      if (/[A-Z]/.test(char)) {
        const mapping = this.constants.CHECK_DIGIT_MAP.find(([letter]) => letter === char);
        value = mapping ? mapping[1] : 0;
      } else {
        value = parseInt(char, 10);
      }

      sum += value * this.constants.WEIGHTS[i];
    }

    const remainder = sum % 11;
    return remainder === 10 ? 'X' : remainder.toString();
  }

  // 验证VIN
  validateVin(vin) {
    if (!vin || vin.length !== 17) {
      return false;
    }

    // 检查字符是否合法
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return false;
    }

    // 验证校验位
    const checkDigit = this.calculateCheckDigit(vin);
    return vin[8] === checkDigit;
  }

  // 生成VIN
  generateVin(maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const beforeStr = this.generateBeforeStr();
        const afterStr = this.generateAfterStr();
        const preVin = beforeStr + 'X' + afterStr;
        const checkDigit = this.calculateCheckDigit(preVin);
        const vin = beforeStr + checkDigit + afterStr;

        if (this.validateVin(vin)) {
          return vin;
        }
      } catch (error) {
        console.error('Error generating VIN:', error);
  }
}
    throw new Error('Failed to generate valid VIN after maximum attempts');
  }
}

// 导出生成器实例
const vinGenerator = new VinGenerator();
export default vinGenerator.generateVin.bind(vinGenerator);
