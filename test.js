const ind = require('./index');
const test = require('./test-event.json');


async function main(){
    let r = await ind.handler(test); 
    //console.log(r);
}

main();