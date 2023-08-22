const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const PATH_OUT_DIR = "out";

const checkIfFileExists = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const createDirectoryIfNotExists = (dirPath) => {
  const dirExists = fs.existsSync(dirPath);
  if (!dirExists) fs.mkdirSync(dirPath, { recursive: true });
};

const getFileNameWithoutExtension = (filePath) => {
  const fileNameWithExtension = path.basename(filePath);
  const extIndex = fileNameWithExtension.lastIndexOf(".");
  const fileNameWithoutExtension = fileNameWithExtension.substring(
    0,
    extIndex !== -1 ? extIndex : undefined
  );
  return fileNameWithoutExtension;
};

const readYamlFile = (path) => {
  const rawStringData = fs.readFileSync(path, { encoding: "utf-8" });
  const yamlData = yaml.load(rawStringData);

  return yamlData;
};

const readJsonFile = (path) => {
  const rawStringData = fs.readFileSync(path, { encoding: "utf-8" });
  const jsonData = JSON.parse(stripBOM(rawStringData));

  return jsonData;
};

const stripBOM = (content) => {
  content = content.toString();
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
};

const writeJsonFile = (jsonData, fileNameWithoutExtension) => {
  const rawStringData = JSON.stringify(jsonData, null, 2);

  createDirectoryIfNotExists(PATH_OUT_DIR);

  const outFilePath = path.join(
    PATH_OUT_DIR,
    `${fileNameWithoutExtension}.json`
  );
  fs.writeFileSync(outFilePath, rawStringData, { encoding: "utf-8" });
};

const writeXlsxFile = async (workbook, fileNameWithoutExtension) => {
  createDirectoryIfNotExists(PATH_OUT_DIR);
  const outFilePath = path.join(
    PATH_OUT_DIR,
    `${fileNameWithoutExtension}.xlsx`
  );
  await workbook.xlsx.writeFile(outFilePath);
};

module.exports = {
  readYamlFile,
  readJsonFile,
  writeJsonFile,
  writeXlsxFile,
  getFileNameWithoutExtension,
  checkIfFileExists,
};
