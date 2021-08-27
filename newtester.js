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

//  create connection to supabase
const addy = 'https://ymbfscerlnfxbmworhbq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTgzNjI5OCwiZXhwIjoxOTQ1NDEyMjk4fQ.Db41_kA7IeDZP2U9SXMHQ630g3PsyBFI2xoo824QVao';
const supabase = createClient(addy, key);

var os_ids = []
var supa_ids = []
const { data, error } = await supabase
    .from('connect_test')
    .select('id,opensea_id,name')
for (let i = 0; i < data.length; i++) {
    os_ids.push(data[i].opensea_id)
    supa_ids.push(data[i].id)
};


var supa_index = os_ids.indexOf('10210');
console.log(supa_ids[supa_index]);
