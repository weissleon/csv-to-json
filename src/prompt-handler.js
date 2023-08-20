const { config } = require("./config-handler");
const prompts = require("prompts");

const showWelcomeMessage = () => {
  console.clear();
  console.log(`${config.title} v${config.version}`);
};

const showActionSelectionPrompt = async () => {
  const { action } = await prompts({
    message: "Please choose your action",
    name: "action",
    type: "select",
    choices: [
      { title: "JSON → Xlsx", value: "jsonToXlsx" },
      { title: "Xlsx → JSON", value: "xlsxToJson" },
    ],
  });

  return action;
};

const showFilePathInputPrompt = async (message, validate = () => true) => {
  const { filePath } = await prompts({
    type: "text",
    name: "filePath",
    message: message,
    validate: validate,
  });

  return filePath;
};

const showExitMessagePrompt = (message) => {
  const readline = require("readline");

  console.log(message);
  console.log("Press any key to exit...");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (line) => rl.close());
  rl.on("close", () => process.exit());
};

const showConfirmMessagePrompt = async (message) => {
  const { confirm } = await prompts({
    message: message,
    name: "confirm",
    type: "confirm",
  });

  return confirm;
};

module.exports = {
  showWelcomeMessage,
  showActionSelectionPrompt,
  showFilePathInputPrompt,
  showConfirmMessagePrompt,
  showExitMessagePrompt,
};
