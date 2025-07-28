// 1. 필요한 프로그램들을 불러옵니다.
const express = require('express');
const axios = require('axios');
const path = require('path');

// 2. Express 앱을 생성합니다.
const app = express();

// 3. Render와 같은 클라우드 환경에서 지정해주는 PORT를 사용하도록 설정합니다.
//    만약 지정된 PORT가 없으면 로컬 테스트를 위해 3000번을 사용합니다.
const PORT = process.env.PORT || 3000;

// 4. 'public' 폴더에 있는 정적인 파일(html, css 등)을 제공하도록 설정합니다.
//    이렇게 하면 dictionary.html 파일을 브라우저가 직접 접근할 수 있습니다.
app.use(express.static(path.join(__dirname, 'public')));

// 5. '/api/translate' 경로로 GET 요청이 오면 처리할 프록시 API를 만듭니다.
app.get('/api/translate', async (req, res) => {
    // URL의 쿼리 파라미터에서 'word'를 추출합니다. (예: /api/translate?word=apple)
    const { word } = req.query;

    // 만약 'word'가 없으면, 400 Bad Request 오류를 응답합니다.
    if (!word) {
        return res.status(400).json({ error: 'A word to search is required.' });
    }

    // 실제 Glosbe API의 주소
    const glosbeApiUrl = `https://glosbe.com/gapi/translate?from=eng&dest=kor&format=json&phrase=${encodeURIComponent(word)}`;

    try {
        // 우리 서버가 Glosbe 서버로 단어 정보를 요청합니다.
        console.log(`Requesting to Glosbe for the word: ${word}`);
        const apiResponse = await axios.get(glosbeApiUrl);

        // Glosbe로부터 성공적으로 받은 JSON 데이터를 클라이언트(브라우저)에 그대로 전달합니다.
        res.status(200).json(apiResponse.data);

    } catch (error) {
        // Glosbe API 요청 중에 오류가 발생한 경우
        console.error('Error while fetching from Glosbe API:', error.message);

        // 클라이언트(브라우저)에게 서버 내부 오류가 발생했음을 알립니다.
        res.status(500).json({ error: 'Failed to fetch data from the external dictionary API.' });
    }
});

// 6. 웹사이트의 루트 주소('/')로 접속했을 때, 'public' 폴더의 dictionary.html 파일을 보여줍니다.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dictionary.html'));
});

// 7. 위에서 설정한 PORT 번호로 서버를 실행하고, 성공하면 콘솔에 메시지를 출력합니다.
app.listen(PORT, () => {
    console.log(`Dictionary server is running and listening on port ${PORT}`);
});