const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Thamani za AzamPay (weka zako halisi hapa)
const AZAMPAY_APP_NAME = 'LEO SHOPS';
const TOKEN_URL = '1d4ebbcc-c9dc-4ee3-84d8-f7156f5e6055';
const PAYMENT_URL = 'https://sandbox.azampay.co.tz/api/v1/checkout/create';

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));  // Hudumia folda ya 'public'

// Route ya mzizi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function ya kupata token
async function getAccessToken() {
    try {
        const response = await axios.post(TOKEN_URL, { appName: AZAMPAY_APP_NAME });
        return response.data.token;
    } catch (error) {
        console.error('Hitilafu ya kupata token:', error?.response?.data || error);
        throw new Error("Imeshindikana kupata token.");
    }
}

// Endpoint ya malipo
app.post('/pay', async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body;

        if (!amount || !phoneNumber) {
            return res.status(400).json({ error: "Tafadhali jaza taarifa zote zinazohitajika" });
        }

        // Pata token mpya
        const accessToken = await getAccessToken();

        // Omba malipo kupitia AzamPay API
        const paymentResponse = await axios.post(PAYMENT_URL, {
            amount: amount,
            currency: "TZS",
            accountNumber: phoneNumber,
            provider: "Vodacom",
            externalId: `PCB_ORDER_${Date.now()}`,
            redirectUrl: "http://localhost:3000/success"
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json({ payment_url: paymentResponse.data.data.redirectUrl });

    } catch (error) {
        console.error(error?.response?.data || error);
        res.status(500).json({ error: "Malipo yameshindwa. Tafadhali jaribu tena." });
    }
});

// Mafanikio ya malipo
app.get('/success', (req, res) => {
    res.send('<h1>✅ Malipo yamefanikiwa! Asante kwa kununua PCB.</h1>');
});

// Kuanza seva
app.listen(PORT, () => console.log(`🚀 Seva inafanya kazi kwenye http://localhost:${PORT}`));
