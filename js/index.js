var person = prompt("Please enter your name", "Harry Potter");

var localStream;

const peer = new Peer(person, {
    host: '26491569037b.ngrok.io',
    path: '/peerjs',
});
// const conn = peer.connect('another-peers-id');
// conn.on('open', () => {
//   conn.send('hi!');
// });

// 檢查麥克風
checkDevice();
// 顯示所有頻道
getAllChannel();

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
            // 重整畫面
            $("#channel-list").html('');
            getAllChannel();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

// 撈出所有頻道
function getAllChannel() {

    $.ajax({
        url: "/getAllChannel",
        data: "",
        dataType: "json",
        type: "GET",
        contentType: "application/json;charset=utf-8",
        success: function (channelList) {
            console.log(channelList);

            let parent = $("#channel-list");

            channelList.forEach(function (channel) {

                let container = $("<div>").addClass("card")

                let channelHeader = $("<div>").addClass("card-header").text(channel.channel_name);

                let ul = $("<ul>").addClass("list-group list-group-flush").attr('id', channel.channel_name);

                let jsonArray = JSON.parse(channel.channel_people);
                for (let i = 0; i < jsonArray.length; i++) {
                    let li = $("<li>").addClass("list-group-item").text(jsonArray[i]);
                    ul.append(li);
                }

                container.append(channelHeader).append(ul);
                parent.append(container);
            });

            // // 啟動加入功能
            // enableComponent();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

// // 點擊加入頻道
// function enableComponent() {
//     $('#channel-list').find(".card").each(function () {
//         $(this).click(function () {
//             let id = $(this).find("ul").attr("id");
//             console.log(id);

//             let dataJSON = {}
//             dataJSON.id = id;
//             dataJSON.people = person;

//             $.ajax({
//                 url: "/joinChannel",
//                 data: JSON.stringify(dataJSON),
//                 type: "POST",
//                 contentType: "application/json;charset=utf-8",
//                 success: function (returnData) {
//                     // 重整畫面
//                     $("#channel-list").html('');
//                     getAllChannel();
//                 },
//                 error: function (xhr, ajaxOptions, thrownError) {
//                     console.log(xhr.status);
//                     console.log(thrownError);
//                 }
//             });
//         });
//     });
// }
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