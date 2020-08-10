const express = require('express');
const app = express();
const uuid = require('uuid');
const bodyParser = require('body-parser');
const http_module = require('http');
const http = http_module.Server(app);

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const mysql = require("mysql2");
const jsonParser = express.json();

const session = require('express-session');
const FileStore = require('session-file-store')(session); // подключаем всю нашу ересь
const passport = require('passport');
app.use(express.json()); //Переводим все полученные данные в объекты json
app.use(express.urlencoded({extended: true})); //Запрещаем формировать массивы(Если передаете массив данных,лучше поставить true)
//Инициализируем сессию
app.use(
  session({
    secret: "test", //Задаем ключ сессий
    store: new FileStore(), //Указываем место хранения сессий(Используя этот пакет,у вас будет создана папка sessions, в которой будут хранится сессии и, даже если сервер перезагрузится,пользователь останется авторизованным
    cookie: {
      path: "/",
      httpOnly: true, // path - куда сохранять куки, httpOnly: true - передача данных только по https/http,maxAge - время жизни куки в миллисекундах 60 * 60 * 1000 = 1 час 
      maxAge: 60 * 60 * 1000
    },
    resave: false,
    saveUnitialized: false
  })
);
require('./config');
app.use(passport.initialize()); //Инициализируем паспорт
app.use(passport.session()); //Синхронизируем сессию с паспортом
//Проверяем если авторизован - пропускаем дальше,если нет запрещаем посещение роута
const logout = (req,res,next) => {

  if(req.isAuthenticated()) {
    return res.redirect('/admin');
  } else {
    next()
  }
}

const auth = (req,res,next) => {
  if(req.isAuthenticated()) {
    next()
  } else {
  //  return res.redirect('/');
  }
}

app.get('/logout', (req,res) => {
 var ipout=getClientIp(req)
 ipout=ipout.split(':')[3];
  connection.query(`UPDATE user_history SET timeexit= '${new Date().toISOString()}' where iduser='${userid}' and ipuser='${ipout}' and timeexit is null`)
  req.logout();
  res.redirect('/');
});

var ip;
var userid;
var formid;
  app.set("view engine", "ejs");
  app.use(express.static(`${__dirname}/views`));
const connection = mysql.createConnection({
  host: "localhost",
  user: "adm",
  database: "forms",
  password: "123"
});

connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
});

app.use(express.static(__dirname + '/static'));





app.get('/', (req,res)=>{
  ip=req.ip.split(':')[3]
 res.render('login',{text:''})
  
});
app.get('/login', function(req,res){
 res.render('login',{text:'Неверный пароль!'})
})

function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};



app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {




  connection.query(`select id from users where username='${req.body.login}'`,function(err,results,fields){
userid=results[0]['id']

  ip=getClientIp(req)
ip=ip.split(':')[3];

connection.query(`INSERT INTO user_history (iduser,ipuser,timeenter) VALUES ('${userid}', '${ip}', '${new Date().toISOString()}')`)

connection.query(`UPDATE users set ip= '${ip}' where id='${userid}' and ip is null`)
  var forms=[];
  connection.query(`Select * FROM forms`,function(err, results, fields) {
  if (!results){
    console.log('!Results')
  }else{

for (let i=0; i<results.length;i++){
  forms[i]=[results[i]['id'],results[i]['name']]
}
  }
  
  res.render('forms_list',{test: forms});
})
  
})
});

app.get('/forms_list',function(req,res){


 var forms=[];
  connection.query(`Select * FROM forms`,function(err, results, fields) {
  if (!results){
    console.log('!Results')
  }else{

for (let i=0; i<results.length;i++){
  forms[i]=[results[i]['id'],results[i]['name']]
}
  }
  
  res.render('forms_list',{test: forms});
})

});



app.post('/comparison', auth, jsonParser,function(req,res){
  var result = req.body.answers

for (let i=0;i<result.length;i++){
  connection.query(`INSERT INTO answers (iduser, idform, idquest, answer, formDt)
VALUES ( '${userid}', '${formid}', ${result[i].id},${result[i].val},'${new Date().toISOString()}')`,function(err, results, fields) {


})

}

})





var comparableUserId
app.get('/comparison', auth, function(req,res){
  res.render('comparison', {text:''});
});







app.post('/comparisonform', auth,  function(req,res){
  var questions=[]
comparableUserId=req.body.comparabaleUser
connection.query(`SELECT id from users where username = '${comparableUserId}'`,function(err, results, fields){

  if(results!=''){
var idcomparableuser = results[0]['id'];
connection.query(`INSERT INTO compare_history (iduser,idform,idComparableUser) VALUES('${userid}','${formid}','${idcomparableuser}')`)
}
})
console.log(`THIS IS PARAMETERS: ${formid}, ${comparableUserId}, ${userid}`)
connection.query(`select id,name,1 as answer from questions where id in(select a1.idquest from answers a1 inner join answers a2 on a1.idform=a2.idform and a1.idquest=a2.idquest and a1.answer=a2.answer and a1.answer=1 and a2.answer=1  and a1.iduser= '${userid}' and a1.idform ='${formid}' and a2.idform ='${formid}'  and a2.iduser in(select id from users where username = '${comparableUserId}' )and a2. formDt= (select max(formDt) from answers where iduser=(select id from users where username = '${comparableUserId}' ))) order by questorder asc;`, function(requestQuery,resultQuery){
 console.log(resultQuery)
    if (resultQuery.length==0){
        res.render('comparison',{text:'Пользователь не найден, либо нет совпавших ответов'});
    }else{

     for (let i=0; i<resultQuery.length;i++){
  questions[i]=[resultQuery[i]['id'],resultQuery[i]['name'],resultQuery[i]['answer']]
}
  
 res.render('comparisonform',{quest: questions});
  }
  

    
  })



})
app.post('/editresult', auth, jsonParser,function(req,res){
  var result = req.body.answers
for (let i=0;i<result.length;i++){
  connection.query(`UPDATE answers SET answer=${result[i].val} where iduser='${userid}' and idquest='${result[i].id}' and idform='${formid}'`,function(err, results, fields) {


})

}

})





app.get('/editform?:id', auth, function(req,res){
var questions=[]
formid=req.query.id
connection.query(`Select id,name,a.answer FROM questions q inner join answers a on q.id=a.idquest and a.idform='${formid}' and a.iduser='${userid}' order by q.questorder asc,formDt desc`,function(err, results, fields) {
  if (!results){
    console.log('!Results')
  }else{
for (let i=0; i<results.length;i++){
  questions[i]=[results[i]['id'],results[i]['name'],results[i]['answer']]
}
  }
  
 res.render('formedit',{quest: questions});
})

})


app.get('/showform?:id', auth, function(req,res){
var questions=[]

formid=req.query.id
connection.query(`Select * from answers where idform = '${req.query.id}' and iduser='${userid}'`, function(err,results,fields)
{
  console.log(results)
  if (results!=''){
    res.redirect(`/editform?id=${req.query.id}`);
  }else{
connection.query(`Select * FROM questions where idform="${req.query.id}" order by questorder asc`,function(err, results, fields) {
  if (!results){
    console.log('!Results')
  }else{

for (let i=0; i<results.length;i++){
  questions[i]=[results[i]['id'],results[i]['name']]
}
  }
 res.render('form',{quest: questions});
})


  }
})






})
app.listen(8080) 
