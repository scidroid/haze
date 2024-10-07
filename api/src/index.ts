import { Hono } from "hono";
import { cors } from "hono/cors";

const twilio = require("twilio");
import { Deta } from "deta";

const base = Deta("your_deta_key").Base("haze");

const client = twilio(
  "your_account_sid",
  "your_twilio_key"
);

const app = new Hono();

async function makeCall(phone: string, isSequia: boolean) {
  return await client.calls.create({
    from: "your_twilio_number",
    to: phone,
    twiml: `<Response><Say language="es-ES">Nuestro sistema ha detectado riesgo de ${
      isSequia ? "sequía" : "inundación"
    } en su zona, por favor tomar precaución.</Say></Response>`,
  });
}

app.use(
  cors({
    origin: ["*"],
  })
);

app.post("/register", async (c) => {
  const { name, lat, lng, phone } = await c.req.json();

  await base.insert({
    name,
    lat,
    lng,
    phone,
  });

  return c.json({ message: "Done!" }, 200);
});

app.get("/data", async (c) => {
  const data = await base.fetch();

  return c.json({ data }, 200);
});

app.post("/call", async (c) => {
  const { phone } = await c.req.json();

  const call = await makeCall(phone, false);

  return c.json({ message: call.sid }, 200);
});

export default app;
