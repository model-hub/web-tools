//车架号地区代码数组
var areaArray = ['1', '2', '3', '6', '9', 'J', 'K', 'L', 'R', 'S', 'T', 'V', 'W', 'Y', 'Z', 'G']

//车架号中可能出现的字符数组
var charArray = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'V',
  'W',
  'X',
  'Y'
]

//车架号校验位计算数组
var KVMACTHUP = [
  ['A', 1],
  ['B', 2],
  ['C', 3],
  ['D', 4],
  ['E', 5],
  ['F', 6],
  ['G', 7],
  ['H', 8],
  ['I', 0],
  ['J', 1],
  ['K', 2],
  ['L', 3],
  ['M', 4],
  ['N', 5],
  ['O', 0],
  ['P', 7],
  ['Q', 8],
  ['R', 9],
  ['S', 2],
  ['T', 3],
  ['U', 4],
  ['V', 5],
  ['W', 6],
  ['X', 7],
  ['Y', 8],
  ['Z', 9]
]

//车架号数据加权数组
var WEIGHTVALUE = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

//生产年份代码(第12~13位)
var strYear = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'V',
  'W',
  'X',
  'Y'
]

//出厂顺序代码(第12~13位)
var strCode = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'V',
  'W',
  'X',
  'Y'
]

//出厂顺序代码(第14~17位)
var strCodeNo = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function getRandomVin() {
  var beforeStr = prepareBeforeStr()
  var afterStr = prepareAfterStr()
  return spellVin(beforeStr, afterStr)
}

function prepareBeforeStr() {
  var str = 'LFV'
  for (var i = 0; i < 5; i++) {
    str += getRandomChar(areaArray)
  }
  return str
}

function getRandomChar(array) {
  var index = getRandomInt(array.length)
  return charArray[index]
}

function getRandomInt(n) {
  return Math.floor(Math.random() * n)
}

function prepareAfterStr() {
  var str = ''
  for (var i = 0; i < 1; i++) {
    var index = getRandomInt(strYear.length)
    var year = strYear[index]
    str += year
  }
  str += prepareNo()
  return str
}

function prepareNo() {
  var numStrBuff = ''
  for (var i = 0; i < 3; i++) {
    var index1 = getRandomInt(strCode.length)
    numStrBuff += strCode[index1] //第11~13位车架号
  }
  for (var i = 0; i < 4; i++) {
    var index2 = getRandomInt(strCodeNo.length)
    numStrBuff += strCodeNo[index2] //第14~17位车架号
  }
  return numStrBuff
}

function spellVin(beforeStr, afterStr) {
  var vinBuffer = ''
  var preVin = beforeStr + 'X' + afterStr
  var isuredCode = getIsuredCode(preVin)
  var vin = beforeStr + isuredCode + afterStr
  if (isVin(vin)) {
    return vin
  } else {
    return spellVin(beforeStr, afterStr)
  }
}

function getIsuredCode(vin) {
  var Vin = []
  for (const s2 of vin) {
    Vin.push(s2)
  }
  var sum = 0
  var tempValue = 0
  var temp
  for (var i = 0; i < 17; i++) {
    if (Vin[i] >= 'a' && Vin[i] <= 'z') {
      temp = Vin[i] - 32
    } else if (Vin[i] >= 'A' && Vin[i] <= 'Z') {
      temp = Vin[i]
    } else if (Vin[i] >= '0' && Vin[i] <= '9') {
      tempValue = Vin[i]
      temp = Vin[i]
    } else {
      return 'ERROR'
    }
    if (temp >= 'A' && temp <= 'Z') {
      for (var j = 0; j < 26; j++) {
        if (temp == KVMACTHUP[j][0]) {
          tempValue = KVMACTHUP[j][1]
        }
      }
    }
    sum += tempValue * WEIGHTVALUE[i]
  }
  var reslt = sum % 11
  if (reslt != 10) {
    return reslt + ''
  } else {
    return 'X'
  }
}

function isVin(vin) {
  var isuredCode = getIsuredCode(vin)
  if (vin.substring(8, 9) === isuredCode) {
    return true
  } else {
    return false
  }
}

export default getRandomVin
