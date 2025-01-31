import express from "express";

const { PORT, HOSTNAME, SITE_ID, API_KEY, DEVICES } = process.env;

const devicesByMacAddress = {};

DEVICES.split(",").forEach((d) => {
  const [name, mac] = d.split("_");

  devicesByMacAddress[mac] = name;
});

(async () => {
  const app = express();

  app.get("/presence", async function (req, res) {
    try {
      const resp = await fetch(
        `https://${HOSTNAME}/proxy/network/integrations/v1/sites/${SITE_ID}/clients?${new URLSearchParams(
          {
            limit: 200,
          },
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
          },
        },
      );

      const clients = (await resp.json()).data;

      const presence = {};

      clients.forEach(({ macAddress }) => {
        if (devicesByMacAddress[macAddress]) {
          presence[devicesByMacAddress[macAddress]] = true;
        }
      });

      res.send(presence);
    } catch (error) {
      console.log("ERROR: " + error);
    }
  });

  app.listen(PORT);
})();
