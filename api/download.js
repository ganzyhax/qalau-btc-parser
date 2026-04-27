import * as cheerio from "cheerio";
import ExcelJS from "exceljs";

export default async function handler(req, res) {
  const { from, to } = req.query;

  let page = 1;
  let all = [];

  while (true) {
    const url =
      `https://token.qoldau.kz/ru/references/crypto-currency/list?flCryptoCurrencyType=BTC&flDate_from=${from}&flDate_to=${to}&p=${page}`;

    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    }).then(r => r.text());

    const $ = cheerio.load(html);

    const rows = $("tbody tr");

    if (rows.length === 0) break;

    let valid = 0;

    rows.each((i, el) => {
      const tds = $(el).find("td");

      if (tds.length < 6) return;

      valid++;

      all.push([
        $(tds[0]).text().trim(),
        $(tds[1]).text().trim(),
        $(tds[2]).text().trim(),
        $(tds[3]).text().trim(),
        $(tds[4]).text().trim(),
        $(tds[5]).text().trim(),
      ]);
    });

    if (valid === 0) break;
    page++;
  }

  if (!all.length) {
    return res.status(500).send("❌ Пусто — сайт изменил структуру или блокирует");
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("BTC");

  ws.addRow(["crypto","date","usd_kzt","price_kzt","market_cap","volume"]);

  all.forEach(r => ws.addRow(r));

  const buffer = await wb.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader("Content-Disposition", "attachment; filename=btc.xlsx");

  res.send(buffer);
}
