const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/translate', async (req, res) => {
    const { word } = req.query;

    if (!word) {
        return res.status(400).json({ error: 'A word to search is required.' });
    }

    // --- 여기가 핵심적인 변경사항입니다 ---
    // Glosbe API 주소를 직접 호출하는 대신, CORS 문제를 우회해주는 공개 프록시를 앞에 붙여줍니다.
    const originalGlosbeUrl = `https://glosbe.com/gapi/translate?from=eng&dest=kor&format=json&phrase=${encodeURIComponent(word)}`;
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${originalGlosbeUrl}`;

    try {
        console.log(`Requesting via proxy for the word: ${word}`);
        
        // axios 요청 시, 프록시 서버가 자신을 식별할 수 있도록 Origin 헤더를 추가합니다.
        const apiResponse = await axios.get(proxyUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        res.status(200).json(apiResponse.data);

    } catch (error) {
        console.error('Error while fetching via proxy:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from the external dictionary API via proxy.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dictionary.html'));
});

app.listen(PORT, () => {
    console.log(`Dictionary server is running and listening on port ${PORT}`);
});
