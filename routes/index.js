var express = require('express');
var router = express.Router();
var request = require('request');
var lunchDayCode = -1;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/keyboard', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  console.log(`Server keyboard function start!!`);
  //res.json("{\"type\":\"text\"}");
  var val = { 'type': 'text' };
  res.send(val);

  //result = "{\"type\":\"text\"}";
});

router.post('/message', function(req, res, next) {

  console.log(`------  getMessage  -------`);
  console.log("content : "+req.body.content);
  console.log("type : "+req.body.type);
  console.log("userKey : "+req.body.userKey);
  console.log(`--------------------`);

  var content = req.body.content.trim();

  var result = "{ \"message\":{\"text\" : \"test 입니다.\"} }";

  /*if (content == '오늘메뉴'){
    console.log(`111`);
    request(options, callback);
  }*/

  if ('오늘메뉴' === content.trim()) {
    lunchDayCode = 0;
  }else if('내일메뉴' === content.trim()){
    lunchDayCode = 1;
  }else{
    lunchDayCode = -1;
  }

  if (lunchDayCode == -1){

    var val = { 'message': {'text':'키워드를 다시 입력해주세요.\n- 오늘메뉴\n- 내일메뉴'} };
    res.send(val);
  } else{
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        var menus = info['menus'];

        var result = getTodayLaunch(menus);

        var val = { 'message': {'text':result} };
        res.send(val);
      }else{
        console.log("error : "+error);

        var errorString = error.toString();

        if(errorString.includes('TIME')){
          var val = { 'message': {'text':'서버 응답 시간초과 입니다.\n다시 시도해 주세요'} };
        }else{
          var val = { 'message': {'text':'메뉴 서버 오류 입니다. 잠시후 다시 시도해 주세요.'} };
        }

        res.send(val);
      }
    });
  }



  //res.render('index', { title: 'Express' });
});

const options = {
  url: 'https://noti-me.appspot.com/cafeteria',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.60 Safari/537.1 CoolNovo/2.0.4.16',
    'Accept-Charset': 'utf-8',
    'Referer': 'http://static.nid.naver.com'
  },
  timeout: 4000
};

function getTodayLaunch(menus) {
  var resultString = '';
  var today = new Date();
  var day = today.getDay();
  var dateNumber = today.getDate();

  var menu;
  if (lunchDayCode === 1 && (0 < day && day < 6)){
    menu = JSON.parse(menus[day]);
    dateNumber = today.getDate() + 1;
  }else if (lunchDayCode === 0 && (0 < day && day < 6)){
    menu = JSON.parse(menus[day-1]);
    dateNumber = today.getDate();
  }else{
    resultString = '주말은 운영하지 않습니다.';
    return resultString;
  }

  var date = menu['date'];
  var lunch = menu['lunch'];

  if (date.includes(dateNumber+"일")){
    resultString = date + "\n" + "-------------" + "\n";
    for (var j = 0; j<lunch.length ; j++){
      resultString = resultString + lunch[j] + '\n';
    }

    console.log("resultString : "+resultString);
  }else{
    resultString = '메뉴가 등록되지 않았습니다.';
  }

  return resultString;
  }

function callback(error, response, body) {
  if (!error && response.statusCode === 200) {
    const info = JSON.parse(body);
    var menus = info['menus'];

    getTodayLaunch(menus);


  }else{
    console.log("error : "+error);
  }
}

const TODAY_MENU = 0;
const TOMORROW_MENU = 1;

/*headers.add("Accept-Charset", "utf-8");
headers.add("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.60 Safari/537.1 CoolNovo/2.0.4.16");
headers.add("Referer", "http://static.nid.naver.com");
"https://noti-me.appspot.com/cafeteria"*/

module.exports = router;
