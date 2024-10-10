import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const port = 3000;

// Interface to define the structure of API response items
interface ShabbatEvent {
  title: string;
  date: string;
  category: string;
}

interface ShabbatAPIResponse {
  items: ShabbatEvent[];
}

// Route to get the next Shabbat and Hadlakat Nerot times
app.get("/shabbat-times", async (req: Request, res: Response) => {
  try {
    // Fetch data from Hebcal API for Israel (geonameid=281184)
    const response = await axios.get<ShabbatAPIResponse>(
      "https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&M=on"
    );
    const data = response.data;

    console.log("data", data);

    // Extracting the upcoming Shabbat date and Hadlakat Nerot time
    const shabbatEvent = data.items.find(
      (item) => item.category === "parashat"
    );

    const hadlakatNerotEvent = data.items.find(
      (item) => item.category === "candles"
    );

    console.log("hadlakat Nerot", hadlakatNerotEvent);

    if (hadlakatNerotEvent) {
      // Extracting the date and time from the response

      const hadlakatNerotTime = hadlakatNerotEvent.title.split(" ")[2]; // Extracting the time (HH:MM)
      let shabbatDate;

      console.log("hadlakat Nerot Time", hadlakatNerotTime);

      // Constructing the text response

      if (shabbatEvent) {
        shabbatDate = shabbatEvent.date.split("T")[0]; // Extracting the date (YYYY-MM-DD format)
      }
      // Sending the response

      let textResponse = `The upcoming Shabbat is not found, there is must be an holiday instead, Hadlakat Nerot will be on ${hadlakatNerotTime}.`;

      if (shabbatDate && hadlakatNerotTime) {
        textResponse = `The upcoming Shabbat will be on ${shabbatDate}, and Hadlakat Nerot will be on ${hadlakatNerotTime}.`;
      }

      res.send(textResponse);
    } else {
      res.status(404).send("Shabbat and Hadlakat Nerot times not found.");
    }
  } catch (error) {
    console.error("Error fetching Shabbat times:", error);
    res.status(500).send("Error fetching Shabbat times.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
