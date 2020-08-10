const passport = require('passport'); // Подключаем непонятную ересь
const LocalStrategy = require('passport-local') // Применяем стратегию(В нашем случае username & password) можете почитать в документации на passportjs.org
const mysql = require('mysql2');
const uuid = require('uuid');
const crypto=require('crypto')
var userid=uuid.v4()
//Подключаемся к базе данных
var connection = mysql.createConnection({
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
      console.log("Подключение in config к серверу MySQL успешно установлено");
    }
});
passport.serializeUser(function(user, done) {
	console.log(`USER IS 2 - ${user.id}`)
   if(typeof(user.id)=='undefined'){
          id=userid;
              done(null, id);
        }else{

		done(null, user[0].id);
  }
	});
	//Получаем id пользователя
	passport.deserializeUser(function(id, done) {
                //Строим запрос в базу данных(ищем id пользователя,полученного из стратегии)
	  	connection.query("SELECT * FROM users WHERE id='"+id+"'",function(err,res){
	  		console.log(id);	
        if(typeof(id)=='undefined'){
          id=userid;
          done(null, id);
        }
			  done(null, id);
		});
	
	});

        //Заменяем стандартный атрибут username usernameField: 'email'
        //Получаем данные переданные методом POST из формы email/password
        //Параметр done работает на подобии return он возвращает пользователя или false в зависимости прошел ли пользователь аутентификацию
        passport.use(new LocalStrategy( {usernameField:'login'},
		function(username, password, done) {
connection.query(`SELECT regtime FROM users where username="${username}"`, function(err,results,fields){
if (typeof(results[0])=='undefined'){
 
    regDt=new Date().toISOString();
    var newpwd=password+ regDt;
  newpwd=crypto.createHash('md5').update(newpwd).digest('hex')
    connection.query(`INSERT INTO users (id,username,password,regtime) VALUES ('${userid}', '${username}','${newpwd}','${regDt}')`,
function(err,results,fields){

return done(null,results);
    })
}else{
regtime =results[0]['regtime'];
  var newpwd=password+ regtime;
newpwd=crypto.createHash('md5').update(newpwd).digest('hex')
connection.query(`Select * FROM users where username="${username}" and password = "${newpwd}"`,function(err, results, fields) {
  if (typeof(results[0]) == 'undefined'){
  	return done(null, false);
  }else{
  return done(null,results);
  
  }
   
})
}
})
}
		
	));


