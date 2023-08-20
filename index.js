// 1. check if it is an array or object or value
// 2. if value, push into the array as [key, value]
// 3. if array, process

const { convertJsonToCsv, convertCsvToJson } = require("./src/data-handler");
const {
  writeJsonFile,
  checkIfFileExists,
  readJsonFile,
  writeXlsxFile,
  getFileNameWithoutExtension,
} = require("./src/fs-handler");
const {
  showWelcomeMessage,
  showActionSelectionPrompt,
  showFilePathInputPrompt,
} = require("./src/prompt-handler");

const excelHandler = require("./src/excel-handler");

const run = async () => {
  showWelcomeMessage();
  const action = await showActionSelectionPrompt();

  switch (action) {
    case "jsonToXlsx": {
      const filePath = await showFilePathInputPrompt(
        "Please specify the JSON file path",
        (filePath) => {
          if (!checkIfFileExists(filePath)) return "Such file does not exist.";
          return true;
        }
      );
      const jsonData = readJsonFile(filePath);
      const aoa = convertJsonToCsv(jsonData);

      const wb = excelHandler.create();
      console.log(wb.worksheets);
      const ws = wb.worksheets[0];

      const columnRow = ["key", "value"];
      excelHandler.addRows([columnRow], ws);
      excelHandler.addRows(aoa, ws);
      await writeXlsxFile(wb, getFileNameWithoutExtension(filePath));
      break;
    }

    case "xlsxToJson": {
      const filePath = await showFilePathInputPrompt(
        "Please specify the XLSX file path",
        (filePath) => {
          if (!checkIfFileExists(filePath)) return "Such file does not exist.";
          return true;
        }
      );

      const wb = await excelHandler.from(filePath);
      const ws = wb.worksheets[0];
      const rows = ws
        .getRows(2, ws.rowCount - 1)
        .map((row) => row.values.slice(1))
        .filter((row) => row.length !== 0);

      const jsonData = convertCsvToJson(rows);

      writeJsonFile(jsonData, getFileNameWithoutExtension(filePath));

      break;
    }
    default:
      break;
  }
};

// * CONSTANTS
const PATH_OUT_DIR = "out";

// function processObject(object) {
//   const procData = [];
//   for (const key in object) {
//     switch (checkDataType(object[key])) {
//       case "value":
//         procData.push([key, object[key].toString()]);

//         break;
//       case "array":
//         for (const value of object[key]) {
//           if (isObject(value)) {
//           } else {
//             procData.push([key, value.toString()]);
//           }
//         }

//         break;
//       case "object":
//         const data = processObject(object[key]);

//         for (const datum of data) {
//           const finalKey = `${key}/${datum[0]}`;
//           const value = datum[1];

//           procData.push([finalKey, value]);
//         }

//         break;
//       default:
//         break;
//     }
//   }

//   return procData;
// }

function getFileName(filePath) {
  const path = require("path");
  const fileName = path.basename(filePath);
  return fileName;
}

function generateOutputPath(inputPath) {
  const path = require("path");
  const fileName = path.basename(inputPath).split(".")[0] + ".xlsx";
  const outputPath = path.join(PATH_OUT_DIR, fileName);
  return outputPath;
}

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

function processJSON(json) {
  const procData = processObject(json);

  return procData;
}

async function jsonToXlsx(filePath) {
  const fs = require("fs/promises");
  const rawFile = await fs.readFile(filePath);
  let data = null;

  try {
    data = JSON.parse(rawFile);
  } catch (err) {
    console.log("Invalid JSON");
    process.exit(1);
  }

  const procData = processJSON(data);
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "STOVE INDIE";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("data");
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.columns = [
    {
      header: "key",
      key: "key",
      width: 20,
    },
    { header: "text", key: "text", width: 20 },
  ];

  worksheet.getCell("A1").style = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "BFBFBF" } },
    font: { bold: true },
  };

  worksheet.getCell("B1").style = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "BFBFBF" } },
    font: { bold: true },
  };

  worksheet.addRows(procData);

  const outputPath = generateOutputPath(filePath);
  await workbook.xlsx.writeFile(outputPath);
}

async function xlsxToJson(filePath) {}

// async function run() {
//   const prompts = require("prompts");

//   const response = await prompts([
//     {
//       name: "task",
//       type: "select",
//       choices: ["JSON to xlsx", "xlsx to JSON"],
//       message: "Which task would you like to perform?",
//     },
//     {
//       name: "filePath",
//       type: "text",
//       message: "Please specify the file path:",
//     },
//   ]);

//   const task = response["task"];
//   const filePath = response["filePath"];

//   switch (task) {
//     case 0:
//       await jsonToXlsx(filePath);
//       break;

//     case 1:
//       await xlsxToJson(filePath);
//       break;

//     default:
//       break;
//   }
// }

run();
