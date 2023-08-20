const { readYamlFile } = require("./fs-handler");

const PATH_CONFIG_FILE = "config/config.yaml";

const loadConfig = () => {
  return readYamlFile(PATH_CONFIG_FILE);
};

module.exports = {
  config: loadConfig(),
};
