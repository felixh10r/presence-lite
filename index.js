const Unifi = require("node-unifi");
const express = require("express");

const { PORT, HOSTNAME, HOST_PORT, HOST_USER, HOST_PASSWORD, DEVICES } =
  process.env;

const devices = DEVICES.split(",").map((d) => {
  const [name, mac] = d.split("_");

  return {
    name,
    mac,
  };
});

const unifi = new Unifi.Controller({
  host: HOSTNAME,
  port: HOST_PORT,
  sslverify: false,
});

(async () => {
  await unifi.login(HOST_USER, HOST_PASSWORD);

  const app = express();

  app.get("/presence", async function (req, res) {
    try {
      const clientData = await unifi.getClientDevices();

      const presence = {};

      devices.forEach(({ name, mac }) => {
        presence[name] = clientData.some((cd) => cd.mac === mac);
      });

      res.send(presence);
    } catch (error) {
      console.log("ERROR: " + error);
    }
  });

  app.listen(PORT);
})();
