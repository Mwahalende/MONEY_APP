const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 5000;

// Thamani za AzamPay (weka thamani zako halisi hapa)
const AZAMPAY_APP_NAME = 'jina_la_programu_yako';
const AZAMPAY_CLIENT_ID = 'client_id_yako';
const AZAMPAY_CLIENT_SECRET = 'client_secret_yako';
const AZAMPAY_API_KEY = 'api_key_yako';

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
