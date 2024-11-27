require('dotenv').config();
const axios = require('axios');

async function testDeepAI() {
    const apiKey = process.env.DEEPAI_API_KEY;
    console.log('Using API Key:', apiKey);
    
    try {
        console.log('Making request to DeepAI...');
        const response = await axios({
            method: 'post',
            url: 'https://api.deepai.org/api/text2img',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: 'text=A beautiful sunset over mountains',
            validateStatus: (status) => true
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testDeepAI();
