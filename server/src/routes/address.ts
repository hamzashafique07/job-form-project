// server/src/routes/address.ts
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/lookup", async (req, res) => {
  try {
    const { postcode } = req.body;
    if (!postcode) {
      return res.status(400).json({ error: "Missing postcode" });
    }

    const apiKey = process.env.GETADDRESS_API_KEY;
    const url = `https://api.getAddress.io/find/${encodeURIComponent(
      postcode
    )}?api-key=${apiKey}&expand=true`;

    const { data } = await axios.get(url);

    //Normalize the response into client-friendly shape
    const normalized = {
      addresses: data.addresses.map((a: any, i: number) => ({
        id: String(i),
        label: `${a.line_1} ${a.line_2 || ""} ${a.line_3 || ""}, ${
          a.town_or_city
        }, ${data.postcode}`,
        house: a.line_1,
        street: [a.line_2, a.line_3].filter(Boolean).join(" "),
        city: a.town_or_city,
        county: a.county || a.district || "", // ✅ fallback to district if county missing
        district: a.district || "", // ✅ store district explicitly
        postcode: data.postcode, // use top-level postcode
      })),
    };

    res.json(normalized);
  } catch (err: any) {
    console.error(
      "❌ Address lookup error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

export default router;
