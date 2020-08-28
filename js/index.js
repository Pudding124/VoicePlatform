var person = prompt("Please enter your name", "Harry Potter");

const socket = io();

var localStream;

const peer = new Peer(person, {
    host: 'localhost',
    path: '/peerjs',
    port: 9000,
});

// 檢查麥克風
checkDevice();

peer.on('call', (call) => {
    call.answer(localStream); // Answer the call with an A/V stream.
    console.log("打來:" + call);
    call.on('stream', (remoteStream) => {
        let voice = $('#voice')

        let audio = document.createElement('AUDIO')
        audio.setAttribute("controls", "controls");
        audio.srcObject = remoteStream;
        audio.play();
        voice.append(audio);
    });
});

peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
});

socket.on('connect', () => {
    // either with send()
    socket.emit('personId', person);

    // or with emit() and custom event names
    socket.emit('salutations', 'Hello!', { 'mr': 'john' }, Uint8Array.from([1, 2, 3, 4]));
});


// 收取當前所有頻道資訊
socket.on('channelInfo', (allChannelInfo, allChannel) => {
    console.log("收到頻道資訊，開始更新：" + allChannelInfo);
    let parent = $("#channel-list");

    // 清空 html
    parent.html('');

    allChannel.forEach(function (channel) {

        let container = $("<div>").addClass("card")

        let channelHeader = $("<div>").addClass("card-header").text(channel);

        let ul = $("<ul>").addClass("list-group list-group-flush").attr('id', channel);

        allChannelInfo.forEach(function (channelInfo) {
            let info = channelInfo.split('|');

            if (info[1] === channel) {
                let li = $("<li>").addClass("list-group-item").text(info[0]);
                ul.append(li);
            }
        });

        container.append(channelHeader).append(ul);
        parent.append(container);
    });

    // 啟動加入功能
    enableComponent();
});

/* FUNCTION PLACE */
/* ----------------------------------------------------- */
async function checkDevice() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
}

function sendCall() {
    // let id = document.getElementById('callId').value;
    let list = ['123'];
    list.forEach(function (id) {
        const call = peer.call(id, localStream);
        console.log("打去:" + call);
        call.on('stream', (remoteStream) => {
            let voice = $('#voice')

            let audio = document.createElement('AUDIO')
            audio.setAttribute("controls", "controls");
            audio.srcObject = remoteStream;
            audio.play();
            voice.append(audio);
        });
    })
}

// 新建頻道
function createChannel() {

    let channelName = $("#channel-name").val();

    let dataJSON = {}
    dataJSON.name = channelName;

    $.ajax({
        url: "/addNewChannel",
        data: JSON.stringify(dataJSON),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        success: function (returnData) {
            console.log("success");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

// 撈出所有頻道
// function getAllChannel() {

//     $.ajax({
//         url: "/getAllChannel",
//         data: "",
//         dataType: "json",
//         type: "GET",
//         contentType: "application/json;charset=utf-8",
//         success: function (channelList) {
//             console.log(channelList);

//             let parent = $("#channel-list");

//             channelList.forEach(function (channel) {

//                 let container = $("<div>").addClass("card")

//                 let channelHeader = $("<div>").addClass("card-header").text(channel.channel_name);

//                 let ul = $("<ul>").addClass("list-group list-group-flush").attr('id', channel.channel_name);

//                 let jsonArray = JSON.parse(channel.channel_people);
//                 for (let i = 0; i < jsonArray.length; i++) {
//                     let li = $("<li>").addClass("list-group-item").text(jsonArray[i]);
//                     ul.append(li);
//                 }

//                 container.append(channelHeader).append(ul);
//                 parent.append(container);
//             });

//             // // 啟動加入功能
//             // enableComponent();
//         },
//         error: function (xhr, ajaxOptions, thrownError) {
//             console.log(xhr.status);
//             console.log(thrownError);
//         }
//     });
// }

// 點擊加入頻道
function enableComponent() {
    $('#channel-list').find(".card").each(function () {
        $(this).click(function () {
            let id = $(this).find("ul").attr("id");
            console.log(id);

            socket.emit('join', { 'channel': id, 'person': person });
        });
    });
}
// function addUser() {
//     var container = document.createElement('div');
//     var audio = document.createElement('audio');

//     container.appendChild(audio);
//     document.getElementById('voice').appendChild(container);

//     audio.autoplay = true;
//     audio.controls = false;
//     audio.muted = true;
//     audio.src = URL.createObjectURL(stream);
// }