import { createClient } from '@supabase/supabase-js'



//  create connection to supabase
const addy = 'https://ymbfscerlnfxbmworhbq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTgzNjI5OCwiZXhwIjoxOTQ1NDEyMjk4fQ.Db41_kA7IeDZP2U9SXMHQ630g3PsyBFI2xoo824QVao';
const supabase = createClient(addy, key)


const { data, error } = await supabase
    .from('tinytest')
    .select()

const new_data = [
    { id: 1, other_id: '1', metric: parseFloat(Math.random().toFixed(3))},
    { id: 2, other_id: '2', metric: parseFloat(Math.random().toFixed(3)) },
    { id: 3, other_id: '3', metric: parseFloat(Math.random().toFixed(3)) }
]

for (let i = 0; i < new_data.length; i++) {
    const { data, error } = await supabase
        .from('tinytest')
        .upsert(new_data[i])
}
