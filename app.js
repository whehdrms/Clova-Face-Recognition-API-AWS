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
    limits: { fileSize: 5 * 1024 * 1024 }
 })

app.get('/',function(req,res){
  var someHTML = `<form action="/face" enctype="multipart/form-data" method="POST"> 
  <input type="file" name="image" />
  <input type="submit" value="Upload a file"/>
</form>`
  res.set('Content-Type', 'text/html');
  res.end(someHTML);
});

app.post('/face', upload.single('image'), (req, res, next) => {
  var request = require('request');
  var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식

  var _formData = {
    image:'image',
    image: fs.createReadStream(req.file.path)
  };

  var _req = request.post({url:api_url, formData:_formData,
    headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}}).on('response', function(response) {
      fs.unlinkSync(req.file.path) //사진 삭제
  });
  _req.pipe(res); // 브라우저로 출력
})

app.listen(80, function () {
  console.log('80');
});