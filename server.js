const express = require('express');
const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const ExpressPeerServer = require('peer').ExpressPeerServer;

const app = express();
const server = http.createServer(app);
var indexPage = fs.readFileSync('index.html');

app.get('/', (req, res, next) => res.send('Hello world!'));

server.listen(9000);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true
});

var mysqlCon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "channel",
  port: 3306
});

// mysql 僅連接一次即可，不可多次連接與結束
mysqlCon.connect(function (err) {
  if (err) throw err;
  console.log("Mysql Connected!");
});

app.use('/peerjs', peerServer);
app.use('/js', express.static('js'));
app.use(bodyParser.json());

peerServer.on('connection', (client) => {
  console.log(client.id + " 加入了");
});

peerServer.on('disconnect', (client) => {
  console.log(client.id + " 離開了")
});

app.get('/index', function (request, response) {
  response.writeHeader(200, { 'Content-Type': 'text/html' });
  response.write(indexPage);
  response.end();
});

// 新增頻道
app.post('/addNewChannel', function (request, response) {
  console.log("add new channel: " + request.body.name);
  var sql = "INSERT INTO channel_list (channel_name, channel_people) VALUES ('" + request.body.name + "', '[]')";
  mysqlCon.query(sql, function (error, data) {
    if (error) throw error;
    console.log("save success!!");
    response.send("success");
    response.end();
  });
});

// 獲得所有頻道資訊
app.get('/getAllChannel', function (request, response) {
  mysqlCon.query('SELECT * FROM channel_list', function (err, data) {
    response.send(data);
    response.end();
  });
});

// // 加入頻道
// app.post('/joinChannel', function (request, response) {
//   console.log("join channel: " + request.body.id);
//   console.log("join people: " + request.body.people);

//   // 移除該員所有頻道的資訊
//   mysqlCon.query('SELECT * FROM channel_list', function (err, data) {
//     var sqlData = JSON.stringify(data);
//     var jsonData = JSON.parse(sqlData);

//     for(let i = 0;i<jsonData.length;i++) {
//       // 避免空值
//       if (!jsonData[i]) return;

//       let peopleList = JSON.parse(jsonData[i].channel_people);


//     }

//   });


//   // 抓取特定頻道人員
//   mysqlCon.query('SELECT * FROM channel_list WHERE channel_name="' + request.body.id + '"', function (err, data) {
//     console.log(data);
//     var sqlData = JSON.stringify(data);
//     var jsonData = JSON.parse(sqlData);
//     let peopleList = []

//     // 避免空值
//     if (!jsonData[0]) return;

//     peopleList = JSON.parse(jsonData[0].channel_people);

//     var newList = [];
//     for (let i = 0; i < peopleList.length; i++) {
//       newList.push(peopleList[i]);
//     }
//     if (!newList.includes(request.body.people)) {
//       newList.push(request.body.people);
//     }

//     console.log(newList);
//     // 更新頻道人員
//     let updateSQL = "UPDATE channel_list SET channel_people='" + JSON.stringify(newList) + "' WHERE channel_name='" + request.body.id + "'";
//     mysqlCon.query(updateSQL, function (error, res) {
//       if (error) throw error;
//       console.log("update success!!");
//     });
//   });

//   response.send("success");
//   response.end();
// });
