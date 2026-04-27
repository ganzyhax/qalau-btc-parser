export default async function handler(req, res) {
  const { from, to } = req.query;

  const BASE_URL = "https://token.qoldau.kz/ru/references/crypto-currency/list";

  let page = 1;
  let allData = [];

  while (true) {
    const params = new URLSearchParams({
      flCryptoCurrencyType: "BTC",
      flDate_from: from,
      flDate_to: to,
      p: page
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    const html = await response.text();

    const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/gs)];

    let valid = 0;

    for (let r of rows) {
      const cols = [...r[1].matchAll(/<td>(.*?)<\/td>/g)];

      if (cols.length < 6) continue;

      valid++;

      allData.push([
        cols[0][1].replace(/<.*?>/g, "").trim(),
        cols[1][1].replace(/<.*?>/g, "").trim(),
        cols[2][1].replace(/<.*?>/g, "").trim(),
        cols[3][1].replace(/<.*?>/g, "").replace(/&nbsp;/g, "").trim(),
        cols[4][1].replace(/<.*?>/g, "").replace(/&nbsp;/g, "").trim(),
        cols[5][1].replace(/<.*?>/g, "").replace(/&nbsp;/g, "").trim()
      ]);
    }

    if (valid === 0) break;
    page++;
  }

  // делаем CSV (Excel откроет)
  let csv = "crypto,date,usd_kzt,price_kzt,market_cap,volume\n";

  allData.forEach(r => {
    csv += r.join(",") + "\n";
  });

  res.setHeader("Content-Disposition", "attachment; filename=btc.csv");
  res.setHeader("Content-Type", "text/csv");

  res.send(csv);
}
