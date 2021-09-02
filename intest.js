const dS = [
    {
        parallel_id: 1,
        name: 'card name n',
        opensea_id: '10284',
        parallel: 'a',
        rarity: 'b',
        card_type: 'card',
        supply: 100
    },
    {
        parallel_id: 2,
        name: 'card name d',
        opensea_id: '10250',
        parallel: 'a',
        rarity: 'b',
        card_type: 'card',
        supply: 100
    },
]

var nights = [10284, 10]
var days = [10250, 9]



var indexx = 0

var cardname = dS[indexx]['name']
if (nights.includes(dS[indexx]['opensea_id'])) {
    var cardname = dS[indexx]['name'] + " [Night]";
} else if (days.includes(dS[indexx]['opensea_id'])) {
    var cardname = dS[indexx]['name'] + " [Day]";
}

dS[indexx]['name'] = cardname


if (nights.includes(dS[indexx]['opensea_id'])) {
    dS[indexx]['name'] = dS[indexx]['name'] + " night"
} else if (days.includes(dS[indexx]['opensea_id'])) {
    dS[indexx]['name'] = dS[indexx]['name'] + " day"
}

console.log(dS[indexx], cardname, dS[indexx]['name'])