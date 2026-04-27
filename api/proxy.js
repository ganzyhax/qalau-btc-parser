export default async function handler(req, res) {
  const { from, to, page } = req.query;

  const url =
    `https://token.qoldau.kz/ru/references/crypto-currency/list?flCryptoCurrencyType=BTC&flDate_from=${from}&flDate_to=${to}&p=${page}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html"
    }
  });

  const html = await response.text();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(html);
}
