const marketUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false';

let marketArray;
let totalMarket = 0;

const init = () => {
  storageOrDefault(totalPortefolioInput, 1000);
  storageOrDefault(cryptoRatioRangeInput, 60);
  updateRatioLabels();

  fetch(marketUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      marketArray = data;
      initTable();
    });
};

const initTable = () => {
  totalMarket = marketArray
    .map((c) => c.market_cap)
    .reduce((c1, c2) => c1 + c2);

  totalMarketElem.innerHTML = billionDisplay(totalMarket);

  const totalPortefolio = totalPortefolioInput.value;
  const cryptoRatio = cryptoRatioRangeInput.value / 100;

  marketArray.forEach((c) => {
    let mktCap = billionDisplay(c.market_cap);

    let dominance = c.market_cap / totalMarket;
    let dominanceDisplay = roundDec(dominance * 100, 3) + '%';

    let target = dominance * totalPortefolio * cryptoRatio;
    let targetDisplay = priceDisplay(roundDec(target, 3));

    let price = priceDisplay(roundDec(c.current_price, 3));

    newRow = cryptoTable.insertRow(-1);
    newRow
      .insertCell(0)
      .appendChild(document.createTextNode(c.market_cap_rank));

    let nameCell = newRow.insertCell(1);
    let img = document.createElement('img');
    img.src = c.image;
    img.height = '25';
    img.style = 'vertical-align:middle; padding-right: 20px;';
    nameCell.appendChild(img);
    nameCell.appendChild(document.createTextNode(c.name));

    newRow.insertCell(2).appendChild(document.createTextNode(mktCap));
    newRow.insertCell(3).appendChild(document.createTextNode(dominanceDisplay));
    newRow.insertCell(4).appendChild(document.createTextNode(price));
    newRow.insertCell(5).appendChild(document.createTextNode(targetDisplay));

    Array.from(newRow.cells)
      .filter((cell, index) => index != 1)
      .forEach((cell) => (cell.style.textAlign = 'right'));
  });
};

const cryptoTable = document.getElementById('cryptoTable');
const totalMarketElem = document.getElementById('totalMarketElem');
const totalPortefolioInput = document.getElementById('totalPortefolioInput');
const cryptoRatioRangeInput = document.getElementById('cryptoRatioRangeInput');
const ratioCryptoTd = document.getElementById('ratioCryptoTd');
const ratioCashTd = document.getElementById('ratioCashTd');

cryptoRatioRangeInput.oninput = () => {
  store(cryptoRatioRangeInput);
  updateRatioLabels();
  updateTarget();
};

totalPortefolioInput.oninput = () => {
  store(totalPortefolioInput);
  updateTarget();
};

const updateTarget = () => {
  const totalPortefolio = totalPortefolioInput.value;
  const cryptoRatio = cryptoRatioRangeInput.value / 100;

  marketArray.forEach((c, index) => {
    let dominance = c.market_cap / totalMarket;
    let target = dominance * totalPortefolio * cryptoRatio;
    let targetDisplay = priceDisplay(roundDec(target, 3));
    cryptoTable.rows[index + 1].cells[5].innerHTML = targetDisplay;
  });
};

const updateRatioLabels = () => {
  const cryptoRatio = cryptoRatioRangeInput.value;
  ratioCryptoTd.innerHTML = cryptoRatio + '%';
  ratioCashTd.innerHTML = 100 - cryptoRatio + '%';
};

// Utils
const BILLION = 1000000000;

const billionDisplay = (v) => {
  return priceDisplay(roundDec(parseFloat(v) / BILLION, 3)) + 'B';
};

const roundDec = (floatValue, dec) => {
  let expo = Math.pow(10, dec);
  return (Math.round(floatValue * expo) / expo).toFixed(dec);
};

const priceDisplay = (price) => {
  return '$' + price;
};

// Local storage
const storageOrDefault = (input, defaultValue) => {
  const item = localStorage.getItem(input.id);
  input.value = item ? item : defaultValue;
};
const store = (input) => {
  localStorage.setItem(input.id, input.value);
};
init();
