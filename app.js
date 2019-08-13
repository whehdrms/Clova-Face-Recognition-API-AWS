require('dotenv').config();
var express = require('express');
var app = express();
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var multer = require('multer');
var fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/face', upload.single('image'), (req, res, next) => {
    var request = require('request');
    var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식
    var _formData = {
        image: 'image',
        image: fs.createReadStream(req.file.path)
    };
    var name, confidence
    request.post({
        url: api_url, formData: _formData,
        headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
    }, function (error, response, body) {
        var json = JSON.parse(body);
        name = json.faces[0].celebrity.value;
        confidence = parseFloat(json.faces[0].celebrity.confidence)*100;
        fs.unlinkSync(req.file.path) //사진 삭제

        var api_url2 = 'https://openapi.naver.com/v1/search/image?sort=sim&display=10&query=' + encodeURI(name); // json 결과
        var request2 = require('request');
        var options = {
            url: api_url2,
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        request2.get(options, function (error, response, body) {
            if (response.statusCode == 200) {
                var result = JSON.parse(body);
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write(`<head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>연예인 닮은꼴 찾기</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/earlyaccess/notosanskr.css">
                <style>body { font-family: 'Noto Sans KR'; }</style>
                <meta name="subject" content="연예인 닮은꼴 찾기">
                <meta name="title" content="연예인 닮은꼴 찾기">
                <meta name="author" content="조코딩 jocoding">
                <meta name="keywords" content="연예인 닮은꼴 찾기, 닮은꼴, 연예인, 나와 닮은 연예인, 닮은 연예인, 조코딩, 유튜브 조코딩, jocoding">
                <meta property="og:url"                content="https://celebface.site" />
                <meta property="og:type"               content="website" />
                <meta property="og:title"              content="연예인 닮은꼴 찾기" />
                <meta property="og:description"        content="나와 닮은 연예인 찾기" />
                <meta property="og:image"              content="https://jocoding.netlify.com/jocoding.png" />
                </head>`);
                res.write("<h1 class='mx-auto mt-5 text-center'><strong>" + name + "</strong></h1>");
                res.write("<h2 class='mx-auto mt-1 text-center'>" + confidence.toFixed(3) + "%</h2>");
                res.write("<div class='container mt-3 mb-1'>");
                for (let i = 0; i <result.items.length; i++) {
                    res.write("<img class='img-fluid' src='" + result.items[i].thumbnail + "'/>");
                }
                res.write("<a class='d-block mx-auto mt-1 text-center btn btn-success' href='https://search.naver.com/search.naver?where=image&query="+encodeURI(name)+"'>이미지 더보기</a>");
                res.write("<a class='d-block mx-auto mt-1 text-center btn btn-primary' href='https://celebface.site'>다시하기</a>");
                res.write(`<script src="//developers.kakao.com/sdk/js/kakao.min.js"></script>
                <a id="kakao-link-btn" class="d-block mx-auto mt-1 mb-2 text-center btn btn-warning" href="javascript:;">카카오톡 공유하기</a>
                <script type='text/javascript'>
                    Kakao.init('3c31f7ae003e7bef1b37a469e178c207');
                    Kakao.Link.createScrapButton({
                        container: '#kakao-link-btn',
                        requestUrl: 'https://celebface.site'
                    });
                </script>`);
                res.write(`<style>.bmc-button img{width: 27px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{line-height: 36px !important;height:37px !important;text-decoration: none !important;display:inline-flex !important;color:#ffffff !important;background-color:#FF813F !important;border-radius: 3px !important;border: 1px solid transparent !important;padding: 0px 9px !important;font-size: 17px !important;letter-spacing:-0.08px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Lato', sans-serif !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover, .bmc-button:active, .bmc-button:focus {-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#ffffff !important;}</style><link href="https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext" rel="stylesheet"><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/dsXy90mE2"><img src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/BMC-btn-logo.svg" alt="조코딩 채널 후원하기"><span style="margin-left:5px">조코딩 채널 후원하기</span></a>`);
                res.write("</div>");
                res.write(`<tenping class="adsbytenping" style="width: 100%; margin: 0px auto; display: block; max-width: 768px;" tenping-ad-client="kDKCijBCdsNUwmsO%2f9iAHRm4L0AW2LdDufx8Lm9wkG2yyiBgbHfqBVYmBWIFxtWM" tenping-ad-display-type="67%2be3LHzHbblsB9oLrOpWQ%3d%3d"></tenping><script async src='//ads.tenping.kr/scripts/adsbytenping.min.js' ></script>`);
                res.end();
            } else {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        });
    });
})

app.listen(80, function () {
    console.log('80');
});