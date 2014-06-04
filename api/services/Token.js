var uuid = require("node-uuid");

module.exports.generate = function() {
  return uuid.v4();
}