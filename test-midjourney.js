require('dotenv').config();
const axios = require('axios');

async function testMidjourney() {
    const apiKey = process.env.MIDJOURNEY_API_KEY;
    console.log('Using API Key:', apiKey);
    
    try {
        console.log('Making imagine request to Midjourney...');
        const imagineResponse = await axios({
            method: 'post',
            url: 'https://api.midjourney.com/v2/imagine',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            data: {
                prompt: 'A beautiful sunset over mountains',
                model: 'midjourney-v5'
            },
            validateStatus: (status) => true
        });

        console.log('\nImagine Response Status:', imagineResponse.status);
        console.log('Imagine Response Headers:', JSON.stringify(imagineResponse.headers, null, 2));
        console.log('Imagine Response Data:', JSON.stringify(imagineResponse.data, null, 2));

        if (imagineResponse.data && imagineResponse.data.taskId) {
            const taskId = imagineResponse.data.taskId;
            console.log('\nGot task ID:', taskId);
            console.log('Waiting 5 seconds before checking status...');
            
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('\nChecking task status...');
            const statusResponse = await axios({
                method: 'get',
                url: `https://api.midjourney.com/v2/result/${taskId}`,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                validateStatus: (status) => true
            });

            console.log('Status Response Status:', statusResponse.status);
            console.log('Status Response Headers:', JSON.stringify(statusResponse.headers, null, 2));
            console.log('Status Response Data:', JSON.stringify(statusResponse.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testMidjourney();
