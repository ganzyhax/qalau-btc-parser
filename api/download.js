import ExcelJS from "exceljs";

export default async function handler(req, res) {
  const { from, to } = req.query;

  let page = 1;
  let all = [];

  while (true) {
    const html = await fetch(
      `https://token.qoldau.kz/ru/references/crypto-currency/list?flCryptoCurrencyType=BTC&flDate_from=${from}&flDate_to=${to}&p=${page}`
    ).then(r => r.text());

    const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/gs)];

    let valid = 0;

    for (let r of rows) {
      const cols = [...r[1].matchAll(/<td>(.*?)<\/td>/g)];

      if (cols.length < 6) continue;

      valid++;

      all.push([
        clean(cols[0][1]),
        clean(cols[1][1]),
        clean(cols[2][1]),
        clean(cols[3][1]),
        clean(cols[4][1]),
        clean(cols[5][1]),
      ]);
    }

    if (valid === 0) break;
    page++;
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

function clean(v) {
  return v
    .replace(/<.*?>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();
}
