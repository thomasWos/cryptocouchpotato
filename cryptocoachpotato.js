const BILLION = 1000000000;
const EUROS = ' \u20AC';
const BILLION_EUROS = ' B\u20AC';

class Crypto {
  constructor(number, name, balance, cryptoJson, totalMarket, totalCrypto) {
    this.number = number;
    this.name = name;

    this.balance = balance.amount;
    this.balanceDisplay = roundDec(this.balance, 4) + ' ' + balance.currency;

    this.balanceEur = this.balance * cryptoJson.latest;
    this.balanceEurDisplay = roundDec(this.balanceEur, 3).concat(EUROS);

    let marketCapFloat = parseFloat(cryptoJson.market_cap);
    this.marketBillion = roundDec(marketCapFloat / BILLION, 3);
    this.priceRounded = roundDec(cryptoJson.latest, 2);
    this.weight = marketCapFloat / totalMarket;
    let weight100 = this.weight * 100;
    this.weightDisplay = roundDec(weight100, 3);
    this.updateTotalCrypto(totalCrypto);
  }

  updateTotalCrypto(totalCrypto) {
    this.target = roundDec(totalCrypto * this.weight, 3).concat(EUROS);
    let diff = totalCrypto * this.weight - this.balanceEur;
    this.diffDisplay = roundDec(diff, 3).concat(EUROS);
  }
}

class CrytoController {
  constructor() {
    this.cryptoMap = new Map();
    this.balanceMap = new Map();

    this.totalMarket = 0;
    this.totalMarketDisplay = '';

    this.totalPortefolio = 0;
    this.ratioCrypto = 0.5;
    this.totalCrypto = 0;
  }

  addCryptoBalance(cryptoName, cryptoBalance) {
    this.balanceMap.set(cryptoName, cryptoBalance);
  }

  addJsonCrypto(jsonCrypto, index) {
    let cryptoName = jsonCrypto.name;
    let cryptoBalance = this.balanceMap.get(cryptoName);

    let crypto = new Crypto(
      index + 1,
      cryptoName,
      cryptoBalance,
      jsonCrypto,
      this.totalMarket,
      this.totalCrypto
    );
    this.cryptoMap.set(cryptoName, crypto);
  }

  setTotalMarket(totalMarket) {
    this.totalMarket = totalMarket;
    this.totalMarketDisplay = roundDec(totalMarket / BILLION, 3).concat(
      BILLION_EUROS
    );
  }

  setTotalPortefolio(totalPortefolio) {
    this.totalPortefolio = totalPortefolio;
    this.computeCryptoTarget();
  }

  updateCryptoRatio(cryptoRatio) {
    this.ratioCrypto = cryptoRatio;
    this.computeCryptoTarget();
  }

  computeCryptoTarget() {
    this.totalCrypto = this.totalPortefolio * this.ratioCrypto;
    this.allCrytos().forEach((c) => c.updateTotalCrypto(totalCrypto));
  }

  target(pCryptoName) {
    return this.cryptoMap.get(pCryptoName).target;
  }

  allCrytos() {
    return Array.from(this.cryptoMap.values());
  }
}

function initTable(data) {
  data.forEach((jsonCrypto, index) =>
    crytoController.addJsonCrypto(jsonCrypto, index)
  );

  crytoController.cryptos.forEach(addCryptoToTab);
}

function addCryptoToTab(crypto) {
  newRow = table.insertRow(-1);
  newRow.insertCell(0).appendChild(document.createTextNode(crypto.number));

  let nameCell = newRow.insertCell(1);

  let res = resourcesMap.get(crypto.name);
  if (res != undefined) {
    let img = document.createElement('img');
    img.src = 'img/' + res.img;
    img.height = '25';
    img.width = '25';
    img.style = 'vertical-align:middle; padding-right: 20px;';
    nameCell.appendChild(img);
  }
  nameCell.appendChild(document.createTextNode(crypto.name));
  newRow
    .insertCell(2)
    .appendChild(
      document.createTextNode(crypto.marketBillion.concat(BILLION_EUROS))
    );
  newRow
    .insertCell(3)
    .appendChild(document.createTextNode(crypto.weightDisplay.concat(' %')));
  newRow
    .insertCell(4)
    .appendChild(document.createTextNode(crypto.priceRounded.concat(EUROS)));
  newRow.insertCell(5).appendChild(document.createTextNode(crypto.target));

  Array.from(newRow.cells)
    .filter((cell, index) => index != 1)
    .forEach((cell) => (cell.style.textAlign = 'right'));
}

function roundDec(floatValue, dec) {
  let expo = Math.pow(10, dec);
  return (Math.round(floatValue * expo) / expo).toFixed(dec);
}

function onTotalPortefolioUpdated(portefolioInput) {
  crytoController.setTotalPortefolio(parseFloat(portefolioInput));
  updateTagetColumn();
}

function onRatioRange(ratioInput) {
  let cryptoRatio100 = parseFloat(ratioInput);
  let cashRatio100 = 100 - cryptoRatio100;

  document.getElementById('ratioCryptoTd').innerHTML = cryptoRatio100 + ' %';
  document.getElementById('ratioCashTd').innerHTML = cashRatio100 + ' %';

  let cryptoRatio = cryptoRatio100 / 100;
  crytoController.updateCryptoRatio(cryptoRatio);
  updateTagetColumn();
}

function updateTagetColumn() {
  Array.from(table.rows)
    .filter((row, index) => index != 0)
    .forEach(updateTarget);
}

function updateTarget(row) {
  let crypoName = row.cells[1].innerText;
  row.cells[5].innerHTML = crytoController.target(crypoName);
}

main();
