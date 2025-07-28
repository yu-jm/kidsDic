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

    // --- 여기가 다시 한번 변경된 핵심 부분입니다 ---
    const originalGlosbeUrl = `https://glosbe.com/gapi/translate?from=eng&dest=kor&format=json&phrase=${encodeURIComponent(word)}`;
    
    // 1. 더 안정적인 allOrigins 프록시 서버를 사용하도록 URL을 변경합니다.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(originalGlosbeUrl)}`;

    try {
        console.log(`Requesting via allOrigins proxy for the word: ${word}`);
        const apiResponse = await axios.get(proxyUrl);

        // 2. allOrigins는 응답 데이터를 'contents'라는 필드 안에 JSON 문자열로 담아서 줍니다.
        //    따라서 먼저 contents를 꺼내고, JSON.parse()를 이용해 실제 객체로 변환해야 합니다.
        if (apiResponse.data && apiResponse.data.contents) {
            const actualData = JSON.parse(apiResponse.data.contents);
            res.status(200).json(actualData);
        } else {
            // 비정상적인 응답일 경우 에러 처리
            throw new Error('Invalid response structure from proxy.');
        }

    } catch (error) {
        console.error('Error while fetching via allOrigins proxy:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from the external dictionary API via proxy.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dictionary.html'));
});

app.listen(PORT, () => {
    console.log(`Dictionary server is running and listening on port ${PORT}`);
});
