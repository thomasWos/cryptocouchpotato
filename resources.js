const resources = [
    {
        name: "Bitcoin",
        img: "bitcoin.svg"
    },
    {
        name: "Ethereum",
        img: "ethereum.svg"
    },
    {
        name: "XRP",
        img: "xrp.svg"
    },
    {
        name: "Bitcoin Cash",
        img: "bch.svg"
    },
    {
        name: "Litecoin",
        img: "ltc.svg"
    },
    {
        name: "EOS",
        img: "eos.svg"
    },
    {
        name: "Stellar Lumens",
        img: "xlm.svg"
    },
    {
        name: "Ethereum Classic",
        img: "etc.svg"
    },
    {
        name: "Zcash",
        img: "zec.svg"
    },
    {
        name: "Tezos",
        img: "tezos.png"
    },
    {
        name: "Chainlink",
        img: "chainlink.webp"
    },
    {
        name: "USD Coin",
        img: "usdcoin.webp"
    },
    {
        name: "Basic Attention Token",
        img: "basic-attention-token.webp"
    },
    {
        name: "0x",
        img: "0x.webp"
    },
    {
        name: "Augur",
        img: "augur.webp"
    },
    {
        name: "Dai",
        img: "dai.png"
    },
    {
        name: "Dash",
        img: "dash.png"
    },
    {
        name: "Orchid",
        img: "orchid.ico"
    }
];

const resourcesMap = new Map();
resources.forEach(r => resourcesMap.set(r.name, r));