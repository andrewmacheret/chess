let properties = null;
const loadPropertiesFile = async () => {
  if (properties === null) {
    const data = await fetch("app.json");
    properties = await data.json();
  }
  return properties;
};

export const getSetting = async (setting) =>
  (await loadPropertiesFile())[setting];
