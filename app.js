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
                res.write(`<head><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/earlyaccess/notosanskr.css">
                <style>body { font-family: 'Noto Sans KR'; }</style>
                </head>`);
                res.write("<h1 class='mx-auto mt-5 text-center'><strong>" + name + "</strong></h1>");
                res.write("<h2 class='mx-auto mt-1 text-center'>" + confidence.toFixed(3) + "%</h2>");
                res.write("<div class='container mt-3'>");
                for (let i = 0; i <result.items.length; i++) {
                    res.write("<img src='" + result.items[i].thumbnail + "'/>");
                }
                res.write("</div>");
                res.write("<a class='d-block mx-auto mt-1 text-center' href='https://search.naver.com/search.naver?where=image&query="+encodeURI(name)+"'>이미지 더보기</a>");
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