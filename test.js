import { createClient } from '@supabase/supabase-js'
import fetch from 'cross-fetch';

// set an length count function 
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// get update date/time as int
const datenow = Date.now()

//  create connection to supabase
const addy = 'https://ymbfscerlnfxbmworhbq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTgzNjI5OCwiZXhwIjoxOTQ1NDEyMjk4fQ.Db41_kA7IeDZP2U9SXMHQ630g3PsyBFI2xoo824QVao';
const supabase = createClient(addy, key)

// get supabase Id data for all 
var os_ids = []
var supa_ids = []
var { data, error } = await supabase
    .from('connect_test')
    .select('id,opensea_id')
for (let i = 0; i < data.length; i++) {
    os_ids.push(data[i].opensea_id)
    supa_ids.push(data[i].id)
};

// download github data 
const response = await fetch('https://raw.githubusercontent.com/joemulberry/para_baseinfo/main/core.json', {});
const data_core = await response.json();

const response2 = await fetch('https://raw.githubusercontent.com/joemulberry/parallel/main/data/opensea_parallel_dumps.json', {});
const data_os = await response2.json();

// Create list of IDs
var info = []
for (let i = 0; i < data_core.length; i++) {
    if (data_core[i]['opensea_id'] != '10160') {
        var d = {
            parallel_id: data_core[i]['parallel_id'],
            name: data_core[i]['name'],
            opensea_id: data_core[i]['opensea_id'],
            parallel: data_core[i]['parallel'],
            rarity: data_core[i]['rarity'],
            card_type: data_core[i]['type'],
            day: data_core[i]['day'],
            night: data_core[i]['night'],
            supply: data_core[i]['supply'],
            original_img: data_core[i]['parallel_img']
        };
        info.push(d);
    }
}


for (let i = 0; i < info.length; i++) {

    var the_token_id = info[i]['opensea_id']

    // Create the order api url
    const options = { method: 'GET', headers: { Accept: 'application/json' } };
    var contract_address = '0x76be3b62873462d2142405439777e971754e8e77';
    var fetch_body = 'https://api.opensea.io/wyvern/v1/orders?asset_contract_address=';
    var fetch_body = fetch_body.concat(contract_address);
    var fetch_body = fetch_body.concat('&bundled=false&include_bundled=false&include_invalid=false&token_id=');
    var fetch_body = fetch_body.concat(the_token_id);
    var fetch_body = fetch_body.concat('&limit=50&offset=0&order_by=created_date&order_direction=desc');

    // fetch the order book for the token 

    await new Promise(r => setTimeout(r, 1100));
    const response3 = await fetch(fetch_body, options);
    const orders_wrapper = await response3.json();

    // Catch for an error where there are no orders
    if (Object.keys(orders_wrapper).length == 1) {
        console.log("ordersdata key length is == 1");
    }

    // delve down one level in the json to the list of orders 
    const ordersdata = orders_wrapper['orders'];
    const number_of_orders = Object.size(ordersdata)

    // get last sale information 
    var token_index = data_os.findIndex(x => x.token_id === the_token_id);

    if (data_os[token_index]['last_sale'] === null) {

        var last_sale_dict = {
            currency: null,
            event_timestamp: null,
            eth_price: null,
            usd_price: null,
            hash: null
        }

    } else {

        var token_id = data_os[token_index]['last_sale']['asset']['token_id']
        var currency = data_os[token_index]['last_sale']['payment_token']['symbol']
        var usd_rate = parseFloat(data_os[token_index]['last_sale']['payment_token']['usd_price'])
        var eth_rate = parseFloat(data_os[token_index]['last_sale']['payment_token']['eth_price'])
        var decimals = parseInt(data_os[token_index]['last_sale']['payment_token']['decimals'])
        var event_timestamp = data_os[token_index]['last_sale']['event_timestamp']
        var total_price = data_os[token_index]['last_sale']['total_price']
        var quantity = parseInt(data_os[token_index]['last_sale']['quantity'])

        total_price = (total_price / (10 ** decimals)) / quantity;

        if (currency == 'USDC') {
            var eth_rate = parseFloat(ordersdata[i]['payment_token_contract']['eth_price']);
            var eth_price = total_price * eth_rate;
        } else {
            eth_price = (total_price * eth_rate)
        }

        eth_price = eth_price / quantity
        eth_price = parseFloat(eth_price.toFixed(3));

        var usd_price = eth_price * usd_rate
        var hash = data_os[token_index]['last_sale']['transaction']['transaction_hash']

        var last_sale_dict = {
            currency: currency,
            event_timestamp: event_timestamp,
            eth_price: eth_price,
            usd_price: usd_price,
            hash: hash
        }
    }

    // loop through to grab a list of bids and asks and count them 
    var bids = []
    var asks = []
    var number_of_bids = 0
    var number_of_asks = 0

    for (let f = 0; f < number_of_orders; f++) {

        var decimals = parseFloat(ordersdata[f]['payment_token_contract']['decimals']);
        var eth_price = parseFloat(ordersdata[f]['payment_token_contract']['eth_price']);
        var currency = ordersdata[f]['payment_token_contract']['symbol'];
        var side = ordersdata[f]['side'];
        var base_price = parseInt(ordersdata[f]['base_price']);
        var quantity = parseFloat(ordersdata[f]['quantity']);
        base_price = (base_price / (10 ** decimals)) / quantity;

        if (currency == 'USDC') {
            var eth_rate = parseFloat(ordersdata[f]['payment_token_contract']['eth_price']);
            base_price = base_price * eth_rate;
        }

        base_price = parseFloat(base_price.toFixed(3));

        if (currency != "DAI") {
            if (side == 0) {
                bids.push(parseFloat(base_price));
                number_of_bids += quantity
            } else {
                asks.push(parseFloat(base_price));
                number_of_asks += quantity
            }
        }
    };



    // calculate highest bid
    if (number_of_bids > 0) {
        var highest_bid = Math.max.apply(Math, bids);
    } else {
        var highest_bid = null;
    }

    // calculate the lowest ask 
    if (number_of_asks > 0) {
        var lowest_ask = Math.min.apply(Math, asks);
    } else {
        var lowest_ask = null;
    }

    // calculate the market gap, difference between highest bid and lowest sell 
    if (lowest_ask != null && highest_bid != null) {
        var market_gap = lowest_ask - highest_bid
        market_gap = parseFloat(market_gap.toFixed(3));
    } else {
        var market_gap = null;
    }

    const info_index = info.findIndex(x => x.opensea_id === the_token_id);
    const market_cap = info[i]['supply'] * last_sale_dict['eth_price'];

    var pct_on_sale = number_of_asks / info[i]['supply'];
    var pct_on_sale = parseFloat(pct_on_sale.toFixed(3));

    if (info[i]['name'].includes('[se]')) {
        var is_se = '[SE]'
    } else {
        var is_se = ' '
    };

    if (info[i]['name'].includes('[pl]')) {
        var perfect_loop = '[PL]'
    } else {
        var perfect_loop = ' '
    };

    var supa_index = os_ids.indexOf(info[i]['opensea_id']);

    var cardname = info[i]['name']

    if (info[i]['night'] === 1) {
        var cardname = info[i]['name'] + " [Night]";
    } else if (info[i]['day'] === 1) {
        var cardname = info[i]['name'] + " [Day]";
    }

    if (supa_index === -1) {
        var overview = {
            parallel_id: info[i]['parallel_id'],
            opensea_id: info[i]['opensea_id'],
            parallel: info[i]['parallel'],
            name: cardname,
            rarity: info[i]['rarity'],
            card_type: info[i]['card_type'],
            total_no_sales: data_os[token_index]['num_sales'],
            number_of_bids: number_of_bids,
            number_of_asks: number_of_asks,
            lowest_ask: lowest_ask,
            highest_bid: highest_bid,
            pct_on_sale: pct_on_sale,
            last_sale_price: last_sale_dict['eth_price'],
            market_gap: market_gap,
            market_cap: market_cap,
            is_se: is_se,
            supply: parseInt(info[info_index]['supply']),
            last_update: datenow,
            perfect_loop: perfect_loop,
            img_url: data_os[token_index]['original_img'],
            night: info[i]['night'],
            day: info[i]['day']
        };
    } else {
        var overview = {
            id: supa_ids[supa_index],
            parallel_id: info[i]['parallel_id'],
            opensea_id: info[i]['opensea_id'],
            parallel: info[i]['parallel'],
            name: cardname,
            rarity: info[i]['rarity'],
            card_type: info[infoi_index]['card_type'],
            total_no_sales: data_os[token_index]['num_sales'],
            number_of_bids: number_of_bids,
            number_of_asks: number_of_asks,
            lowest_ask: lowest_ask,
            highest_bid: highest_bid,
            pct_on_sale: pct_on_sale,
            last_sale_price: last_sale_dict['eth_price'],
            market_gap: market_gap,
            market_cap: market_cap,
            is_se: is_se,
            perfect_loop: perfect_loop,
            supply: parseInt(info[info_index]['supply']),
            last_update: datenow,
            img_url: data_os[token_index]['original_img'],
            night: info[i]['night'],
            day: info[i]['day']
        };
    }

    if (info[info_index]['opensea_id'] === 10251) {
        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
        console.log(info[info_index]['name'])
        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    }

    // add updated card information to supabase
    console.log(cardname, 'updated!');
    const { data, error } = await supabase
        .from('connect_test')
        .upsert(overview)

}
