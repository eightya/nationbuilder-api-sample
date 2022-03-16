const fs = require('fs');
const token = fs.readFileSync('./access_code.txt', 'utf-8')
const axios = require('axios');
const NATIONBUILDER_SLUG = process.env.NATIONBUILDER_SLUG;
module.exports = async ({path, method, body, query=[]}) => {

    let url = new URL(path, `https://${NATIONBUILDER_SLUG}.nationbuilder.com/api/v1`);
    //if there are any query params
    query.forEach(item => {
        url.searchParams.set(item.key, item.value);
    });
    url.searchParams.set('access_token', token);

    let options = {
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json'
        }
    }

    if(['put', 'patch', 'post'].indexOf(http_method) > -1) options.data = body;

    let result = await axios(options);
    return result;
}
