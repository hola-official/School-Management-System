const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ClassRegistrationModule", (m) => {

  const classRegistration = m.contract("ClassRegistration");

  return { classRegistration };
});
