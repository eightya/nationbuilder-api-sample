require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

const axios = require('axios');
const fs = require('fs');
const api = require('./utils/http');

const NATIONBUILDER_SLUG = process.env.NATIONBUILDER_SLUG;
const NATIONBUILDER_CLIENT_ID = process.env.NATIONBUILDER_CLIENT_ID;
const NATIONBUILDER_CLIENT_SECRET = process.env.NATIONBUILDER_CLIENT_SECRET;
const HOST = process.env.HOST
const REDIRECT_URI = `${HOST}/auth_redirect`;

app.get('/authenticate', (req, res) => {
    return res.redirect(`https://${NATIONBUILDER_SLUG}.nationbuilder.com/oauth/authorize?response_type=code&client_id=${NATIONBUILDER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
});

app.get('/auth_redirect', async (req, res) => {
    if(req.query.error === 'access_denied') return res.redirect('/authenticate'); //send back to auth screen
    const code = req.query.code;
    let result = await axios({
        method: 'post',
        url: '',
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json'
        },
        data: {
            grant_type: 'authorization_code',
            client_id: NATIONBUILDER_CLIENT_ID,
            client_secret: NATIONBUILDER_CLIENT_SECRET,
            redirect_uri:  REDIRECT_URI,
            code: code
        }
    });

    const token = result.access_token;
    fs.writeFileSync('access_code.txt', token);
    return res.status(200).json({success: true, message: "Access code saved"});
});


/*
This endpoint accepts a body along the lines of: 
{
    "email": "bob@example.com",
    "last_name": "Smith",
    "first_name": "Bob",
    "sex": "M",
    "signup_type": 0,
    "employer": "Dexter Labs",
    "party": "P",
    "registered_address": {
      "state": "TX",
      "country_code": "US"
    }
}

and passes it to Nationbuilder to create.
*/

app.post('/person', async(req, res) => {
    const person = req.body; //todo: validate the person object
    const result = await api({
        path: '/people',
        method: 'post',
        body: {person: person}
    });
    console.log(result);
    return res.status(200).json(result);
})

/*
Accepts a body with updates along the lines of: 
{
    "first_name": "Joe",
    "email": "johndoe@gmail.com",
    "phone": "303-555-0841"
}
*/
app.put('/person/:id', async(req, res) => {
    const person = req.body;
    let result = await api({
        path: `people/${req.params.id}`,
        method: 'put',
        body: {person: person}
    })
    console.log(result);
    return res.status(200).json(result);
})

app.delete('/person/:id', async (req, res) => {
    let result = await api({
        path: `people/${req.params.id}`,
        method: 'delete'
    });
    console.log(result);
    return res.status(204).send();
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})