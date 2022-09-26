import reader from "properties-reader";

let properties = null;
const loadPropertiesFile = async () => {
  if (properties === null) {
    const data = await fetch("app.properties");
    const text = await data.text();
    properties = reader().read(text);
  }
  return properties;
};

export const getSetting = async (setting) =>
  (await loadPropertiesFile()).get(setting);
