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
        .map((row) => {
          const test = row.values.slice(1).map((cell) => {
            let finalCell = cell;
            if (typeof finalCell === "object") {
              if (finalCell["richText"] !== undefined)
                finalCell["richText"].length > 1
                  ? (finalCell = finalCell["richText"][1]["text"])
                  : (finalCell = finalCell["richText"][0]["text"]);
            }
            return finalCell;
          });
          return test;
        })
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

run();
