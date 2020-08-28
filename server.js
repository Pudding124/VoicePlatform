const express = require('express');
const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const app = express();
const server = http.createServer(app);
const indexPage = fs.readFileSync('index.html');
const io = require('socket.io')(server);


server.listen(9000);

// 記錄所有頻道
var allChannel = [];
// 記錄每個頻道人員
var allPeople = [];
// 記錄每個人員所在頻道
var allChannelInfo = [];

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

/* peer server */
peerServer.on('connection', (client) => {
  console.log(client.id + " 加入了");
});

peerServer.on('disconnect', (client) => {
  console.log(client.id + " 離開了")
});
/* peer server end */

/* socket io */
io.on('connect', socket => {

  // handle the event sent with socket.send()
  socket.on('message', (data) => {
    console.log(data);
  });

  // 接收加入的 persion id
  socket.on('personId', (personId) => {
    console.log("新的連線成員：：" + personId);


    // 檢查是否有相同名稱，有則覆蓋
    if (allPeople.includes(personId)) {
      for (let i = 0; i < allChannelInfo.length; i++) {
        let info = allChannelInfo[i].split('|');
        if (info[0] === personId) {
          // 覆蓋
          allChannelInfo[i] = personId + "|" + "-1";
          break;
        }
      }
    } else {
      allPeople.push(personId);
      allChannelInfo.push(personId + "|" + "-1");
    }

    // push 2D array 待解 ***********************
    console.log("allChannelInfo：：" + allChannelInfo);
    io.emit('channelInfo', allChannelInfo, allChannel);
  });

  // handle the event sent with socket.emit()
  socket.on('join', (joinInfo) => {
    console.log("成員加入頻道或離開頻道，頻道更新" + joinInfo);
    let channelName = joinInfo.channel;
    let personId = joinInfo.person;

    for (let i = 0; i < allChannelInfo.length; i++) {
      let info = allChannelInfo[i].split('|');
      if (info[0] === personId) {
        // 覆蓋
        allChannelInfo[i] = personId + "|" + channelName;
        break;
      }
    }

    io.emit('channelInfo', allChannelInfo, allChannel);
  });
});
/* socket io end */

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

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
mysqlCon.query('SELECT * FROM channel_list', function (err, data) {
  var sqlData = JSON.stringify(data);
  var jsonData = JSON.parse(sqlData);

  // 先清空所有頻道
  allChannel = [];

  for (let i = 0; i < jsonData.length; i++) {
    // 避免空值
    if (!jsonData[i]) return;

    let channelName = jsonData[i].channel_name;
    allChannel.push(channelName);

    console.log("目前所有頻道：" + allChannel);
  }
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
