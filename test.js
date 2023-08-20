const { getFileNameWithoutExtension } = require("./src/fs-handler");

const text = "hello.,worldtxt";

const result = getFileNameWithoutExtension(text);
console.log(result);
