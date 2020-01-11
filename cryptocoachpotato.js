const BILLION = 1000000000;
const EUROS = " \u20AC";
const BILLION_EUROS = " B\u20AC";
const EXCLUDE_CRYPTO_NAMES = ["Bitcoin SV", "Single Collateral Dai"];

const ASSETS_URL = "https://www.coinbase.com/api/v2/assets/summary?base=EUR&filter=listed";
const TOKEN_URL = "https://api.coinbase.com/oauth/token";

const COINBASE_CLIENT_ID = "aef108d150b98e03eaa26334ec346213a02a837c144ab9eda556866513c1031c";
const COINBASE_CLIENT_SECRET = "932a5e5807d78b98f39a3861040c9be13e352e5305085bc12143b42e4a785569";
const COINBASE_REDIRECT_URI = "https://cryptocouchpotato.com"

class Crypto {
    constructor(number, cryptoJson, totalMarket, totalCrypto) {
        this.number = number;
        this.name = cryptoJson.name;
        let marketCapFloat = parseFloat(cryptoJson.market_cap);
        this.marketBillion = roundDec(marketCapFloat / BILLION, 3);
        this.priceRounded = roundDec(cryptoJson.latest, 2);
        this.weight = (marketCapFloat / totalMarket);
        let weight100 = this.weight * 100;
        this.weightDisplay = roundDec(weight100, 3);
        this.updateTotalCrypto(totalCrypto)
    }

    updateTotalCrypto(totalCrypto) {
        this.target = roundDec(totalCrypto * this.weight, 3).concat(EUROS);
    }
}

class CrytoController {
    constructor() {
        this.cryptos = [];

        this.totalMarket = 0;
        this.totalMarketDisplay = "";

        this.totalPortefolio = 0;
        this.ratioCrypto = 0.5;
        this.totalCrypto = 0;
    }

    addJsonCrypto(jsonCrypto, index) {
        let crypto = new Crypto(index + 1, jsonCrypto, this.totalMarket, this.totalCrypto);
        this.cryptos.push(crypto);
    }

    setTotalMarket(totalMarket) {
        this.totalMarket = totalMarket;
        this.totalMarketDisplay = roundDec(totalMarket / BILLION, 3).concat(BILLION_EUROS);
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
        this.cryptos.forEach(c => c.updateTotalCrypto(this.totalCrypto));
    }

    target(pCryptoName) {
        return this.cryptos.filter(c => c.name == pCryptoName).map(c => c.target);
    }
}

let table = document.getElementById("cryptoTable");
let totalPortefolioInput = document.getElementById("totalPortefolio");

let crytoController = new CrytoController();

function main() {
    let url = new URL(window.location.href);
    let codeParam = url.searchParams.get("code");
    if (codeParam != null) {
        exchangeCodeToToken(codeParam);
    }

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText).data.filter(availableCrytoPredicate);
            initTable(data);
        }
    };
    xmlhttp.open("GET", ASSETS_URL, true);
    xmlhttp.send();
}

function exchangeCodeToToken(pCode) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.info(this.responseText);
        }
    };

    xmlhttp.open('POST', TOKEN_URL, true);
    let param = 'grant_type=authorization_code';
    param = param + '&code=' + pCode;
    param = param + '&client_id=' + COINBASE_CLIENT_ID;
    param = param + '&client_secret=' + COINBASE_CLIENT_SECRET;
    param = param + '&redirect_uri=' + encodeURIComponent(COINBASE_REDIRECT_URI);
    console.info('param : ' + param);
    xmlhttp.send(param);
}

function initTable(data) {
    let totalMarket = data.map(toMarket).reduce(sum);
    crytoController.setTotalMarket(totalMarket);

    crytoController.setTotalPortefolio(totalPortefolioInput.value);

    data.forEach((jsonCrypto, index) => crytoController.addJsonCrypto(jsonCrypto, index));

    crytoController.cryptos.forEach(addCryptoToTab);
    document.getElementById("totalMarket").innerHTML = crytoController.totalMarketDisplay;
}


function addCryptoToTab(crypto) {
    newRow = table.insertRow(-1);
    newRow.insertCell(0).appendChild(document.createTextNode(crypto.number));

    let nameCell = newRow.insertCell(1);

    let res = resourcesMap.get(crypto.name);
    if (res != undefined) {
        let img = document.createElement("img");
        img.src = "img/" + res.img;
        img.height = "25";
        img.width = "25";
        img.style = "vertical-align:middle; padding-right: 20px;"
        nameCell.appendChild(img);
    }
    nameCell.appendChild(document.createTextNode(crypto.name));
    newRow.insertCell(2).appendChild(document.createTextNode(crypto.marketBillion.concat(BILLION_EUROS)));
    newRow.insertCell(3).appendChild(document.createTextNode(crypto.weightDisplay.concat(" %")));
    newRow.insertCell(4).appendChild(document.createTextNode(crypto.priceRounded.concat(EUROS)));
    newRow.insertCell(5).appendChild(document.createTextNode(crypto.target));

    Array.from(newRow.cells)
        .filter((cell, index) => index != 1)
        .forEach(cell => cell.style.textAlign = "right");
}

function roundDec(floatValue, dec) {
    let expo = Math.pow(10, dec);
    return (Math.round(floatValue * expo) / expo).toFixed(dec);
}

function availableCrytoPredicate(crypto) {
    return !EXCLUDE_CRYPTO_NAMES.includes(crypto.name);
}

function sum(e1, e2) {
    return e1 + e2;
}

function toMarket(crypo) {
    return parseFloat(crypo.market_cap);
}

function onTotalPortefolioUpdated(portefolioInput) {
    crytoController.setTotalPortefolio(parseFloat(portefolioInput));
    updateTagetColumn();
}

function onRatioRange(ratioInput) {
    let cryptoRatio100 = parseFloat(ratioInput);
    let cashRatio100 = 100 - cryptoRatio100;

    document.getElementById("ratioCryptoTd").innerHTML = cryptoRatio100 + " %";
    document.getElementById("ratioCashTd").innerHTML = cashRatio100 + " %";

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