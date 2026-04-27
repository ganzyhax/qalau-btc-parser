import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { from, to } = req.query;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  const url = `https://token.qoldau.kz/ru/references/crypto-currency/list?flCryptoCurrencyType=BTC&flDate_from=${from}&flDate_to=${to}`;

  await page.goto(url, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll("tbody tr");
    const result = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 6) return;

      result.push([
        cols[0].innerText.trim(),
        cols[1].innerText.trim(),
        cols[2].innerText.trim(),
        cols[3].innerText.trim(),
        cols[4].innerText.trim(),
        cols[5].innerText.trim(),
      ]);
    });

    return result;
  });

  await browser.close();

  if (!data.length) {
    return res.status(500).send("Нет данных (даже через browser)");
  }

  let csv = "crypto,date,usd_kzt,price_kzt,market_cap,volume\n";
  data.forEach(r => csv += r.join(",") + "\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=btc.csv");
  res.send(csv);
}
