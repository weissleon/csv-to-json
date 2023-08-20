const ExcelJS = require("exceljs");
const from = async (filePath) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  return wb;
};

const create = () => {
  const wb = new ExcelJS.Workbook();
  wb.addWorksheet("data");
  return wb;
};

const addRows = (rowData, ws) => {
  console.log(ws);
  ws.addRows(rowData);
};

module.exports = {
  from,
  create,
  addRows,
};
