const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv); 

function validateSchema(data, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(validate.errors);
  }
  return valid;
}

module.exports = { validateSchema };
