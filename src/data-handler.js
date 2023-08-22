function isValue(input) {
  const type = typeof input;
  return (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "bigint"
  );
}

function isObject(input) {
  return typeof input === "object";
}

function isArray(input) {
  return Array.isArray(input);
}

function checkDataType(input) {
  if (isValue(input)) return "value";
  if (isArray(input)) return "array";
  if (isObject(input)) return "object";

  return "undefined";
}

function convertJsonToCsv(jsonData, keyPath = []) {
  const csvKVList = [];

  if (isArray(jsonData)) {
    for (let i = 0; i < jsonData.length; i++) {
      const element = jsonData[i];
      const resultingKVList = convertJsonToCsv(element, [...keyPath, `[${i}]`]);
      csvKVList.push(...resultingKVList);
    }
  } else if (isObject(jsonData)) {
    for (const key in jsonData) {
      const value = jsonData[key];
      const resultingKVList = convertJsonToCsv(value, [...keyPath, key]);
      csvKVList.push(...resultingKVList);
    }
  } else if (isValue(jsonData)) {
    csvKVList.push([
      keyPath.join("/"),
      jsonData === null ? "null" : jsonData.toString(),
    ]);
  } else {
    throw new Error("Invalid Data Type!");
  }

  return csvKVList;
}

function convertCsvToJson(csvData) {
  let jsonData = null;

  for (let i = 0; i < csvData.length; i++) {
    const [key, value] = csvData[i];

    const keyParts = key.split("/");

    let lvl = jsonData;
    let prevKey = null;
    for (let j = 0; j < keyParts.length; j++) {
      const subKey = keyParts[j];
      const matchResult = subKey.match(/\[(\d+)\]/);
      const isArray = matchResult !== null;

      if (jsonData === null) {
        jsonData = isArray ? [] : {};
        lvl = jsonData;
      }

      if (prevKey !== null) {
        if (lvl[prevKey] === null || lvl[prevKey] === undefined) {
          lvl[prevKey] = isArray ? [] : {};
        }
        lvl = lvl[prevKey];
      }

      if (isArray) {
        const arrayIdx = matchResult[1];
        prevKey = parseInt(arrayIdx);
      } else {
        prevKey = subKey;
      }

      const isLastLoop = j === keyParts.length - 1;
      if (isLastLoop) {
        lvl[prevKey] = value;

        lvl = jsonData;
        prevKey = null;
      }
    }
  }
  return jsonData;
}

module.exports = {
  convertJsonToCsv,
  convertCsvToJson,
};
