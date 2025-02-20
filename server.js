const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 5000;

// Thamani za AzamPay (weka thamani zako halisi hapa)
const AZAMPAY_APP_NAME = 'LEO SHOPS';
const AZAMPAY_CLIENT_ID = 'be3d79ef-8fc0-4fa0-a56f-a885041e7f0e';
const AZAMPAY_CLIENT_SECRET = 'VDX8v8O7e0H2XbzVLRh/qLxalr2IE7QROdbywwcIcS2bIj0nz8Biadn3wK9YVMU6tNGigTdxShdupLrDjfh5gE3cszK5IhiWFbJgiMBwohKrRLRwO5k1IS93sDiFu/tz5paf74VYdMjWx3BQcfCIJbGDTnLFeVNcw9UJP0m+C8ZjKkfKq3tARfSclNRCqIJ7vVHKTdpa4lG56jjhO1UHf9nJolc2nJkJEtXBNwM9T7VRvjh1P0ufbrThkCXuHRJRDoXL8P6lI2GN0pjKoMFRTwlHdNCe9vv29rApgHlDR2ENwoIJOLrfztB1aWK75SSxG5JMum9+PKJYWlnyAYHMez8zFWAOF11wwWu2AlIxcMM4uFfM8XCkMxP7UVkWusaYaehvcJgw75uDKHb3jGxGJQcS1ekJRdKj3YIeQz0+eygN7qYG4hPWwoPEtERf3dFnAOkPYiv6L0i5oNSEKrPdCPCr03ojR30HMTSpY9SrPrdglLuerIeT/2GsqYLPIozCWBolZr0WOos2bF7LyXF3y6lmB7+4L11L3rJyt25aSWt81oHE2/gFsNVAw5n47Zn4araqvCT6BEdFKWDru7Lpar9oOy4s3T4mezcIvlofhCrRlbGL4CqvkgpVPXWu4WRjcQQdU/xa6pOn6z0/2p008VjO4/wqzjqP2y9z/3wQyMg=';
const AZAMPAY_API_KEY = '1d4ebbcc-c9dc-4ee3-84d8-f7156f5e6055';

app.get('/', (req, res) => {
    res.send('Karibu kwenye Duka la PCB');
});

app.post('/pay', async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body;

        if (!amount || !phoneNumber) {
            return res.status(400).json({ error: "Tafadhali jaza taarifa zote zinazohitajika" });
        }

        // Omba token ya ufikiaji kutoka AzamPay
        const tokenResponse = await axios.post('https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken', {
            appName: AZAMPAY_APP_NAME,
            clientId: AZAMPAY_CLIENT_ID,
            clientSecret: AZAMPAY_CLIENT_SECRET
        }, {
            headers: { 'X-API-KEY': AZAMPAY_API_KEY }
        });

        const accessToken = tokenResponse.data.token;

        // Omba malipo kupitia AzamPay API
        const paymentResponse = await axios.post('https://sandbox.azampay.co.tz/api/v1/checkout/create', {
            amount: amount,
            currency: "TZS",
            accountNumber: phoneNumber,
            provider: "Vodacom", // Badilisha kulingana na mtoa huduma
            externalId: `PCB_ORDER_${Date.now()}`,
            redirectUrl: "http://localhost:5000/success"
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-API-KEY': AZAMPAY_API_KEY
            }
        });

        res.json({ payment_url: paymentResponse.data.data.redirectUrl });

    } catch (error) {
        console.error(error?.response?.data || error);
        res.status(500).json({ error: "Malipo yameshindwa. Tafadhali jaribu tena." });
    }
});

app.get('/success', (req, res) => {
    res.send('<h1>Malipo yamefanikiwa! Asante kwa kununua PCB.</h1>');
});

app.listen(PORT, () => console.log(`🚀 Seva inafanya kazi kwenye http://localhost:${PORT}`));
