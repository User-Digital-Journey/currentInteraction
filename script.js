function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
      results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if(window.location.hash) {
    console.log(location.hash);
    var token = getParameterByName('access_token');

    $.ajax({
        url: "https://api.mypurecloud.de/api/v2/users/me",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'bearer ' + token);},
        success: function(data) {
            console.log(data);
            buildSetting();
        }
    });

    location.hash=''

} else {
    var queryStringData = {
        response_type : "token",
        client_id : "f5f38816-ee55-4596-a187-df89e40ac75e",
        redirect_uri : "https://devlena.d1gtoz2fo9jrqa.amplifyapp.com/"
    }

    window.location.replace("https://login.mypurecloud.de/oauth/authorize?" + jQuery.param(queryStringData));
}

function buildSetting(){
    $(document).ready(function () {
        var start = moment();
        var end = moment().add(24, 'hours');

        $.ajax({
            url: "https://api.mypurecloud.de/api/v2/analytics/conversations/details/query",
            method: "POST",
            timeout: 0,
            headers: {
                "Authorization": "bearer " + token,
                "content-type": "application/json"
            },
            data: JSON.stringify({
                "interval": start.format() + "/" + end.format(),
                "segmentFilters":[{
                    "type":"or",
                    "predicates":[{
                        "dimension":"mediaType",
                        "value":"chat"
                        }, {
                        "dimension":"mediaType",
                        "value":"voice"
                        }, {
                        "dimension": "mediaType", 
                        "value": "callback"
                        }]
                }],
                "conversationFilters": [{
                    "type": "or",
                    "predicates": [{
                        "type": "dimension",
                        "dimension": "conversationEnd",
                        "operator": "notExists",
                        "value": null
                    }]
                }],
                "aggregations":[{
                    "type":"termFrequency",
                    "dimension":"wrapUpCode",
                    "size":10
                }],
                "order":"asc",
                "orderBy":"segmentStart",
                "paging":{
                    "pageSize":100,
                    "pageNumber":1
                }
            }),

            beforeSend: function(xhrMessages){xhrMessages.setRequestHeader('Authorization', 'bearer ' + token);},
            success: function(dataMessages) {
                console.log("BUILD SETTING = " + JSON.stringify(dataMessages));
                dataMessages = dataMessages.conversations;
                console.log("BUILD SETTING CONVERSATION = " + JSON.stringify(dataMessages));

            for (const [keySection, valueSection] of Object.entries(dataMessages)) {
                var conversationId = valueSection.conversationId;
                displayInfos(conversationId);
            }
        }
    })
})}

function displayInfos(conversationId) {

    $.ajax({
        url: "https://api.mypurecloud.de/api/v2/conversations/"+conversationId,
        type: "GET",
        beforeSend: function(xhrMessages){xhrMessages.setRequestHeader('Authorization', 'bearer ' + token);},
        success: function(dataMessages) {
            console.log(dataMessages);
            var dataMessagesAttributes = dataMessages.participants[0].attributes;

            var tableBody = document.getElementById("tableBody");

            var newTrInfos = document.createElement("tr");
            tableBody.appendChild(newTrInfos);

            var newThInfos1 = document.createElement("th");
            newThInfos1.innerHTML = "Attributes";
            newTrInfos.appendChild(newThInfos1);

            var newThInfos2 = document.createElement("th");
            newThInfos2.innerHTML = "Values";
            newTrInfos.appendChild(newThInfos2);

            var infos = new Map([
                ['ID', dataMessages.id],
                ['Start Time', dataMessages.startTime],
                ['End Time', dataMessages.endTime],
                ['Connected Time', dataMessages.participants[0].connectedTime],
                ['dnis', dataMessages.participants[0].dnis],
                ['ani', dataMessages.participants[0].ani]
            ]);

            for (const [key, value] of infos.entries()) {
                var newTr = document.createElement("tr");
                tableBody.appendChild(newTr);
                var newCellKey = newTr.insertCell(-1);
                newCellKey.innerHTML = key;
                var newCellValue = newTr.insertCell(-1);
                newCellValue.innerHTML = value;
            }

            for (const [key, value] of Object.entries(dataMessagesAttributes)) {
                var newTr = document.createElement("tr");
                tableBody.appendChild(newTr);
                var newCellKey = newTr.insertCell(-1);
                newCellKey.innerHTML = key;
                var newCellValue = newTr.insertCell(-1);
                newCellValue.innerHTML = value;
            }
        }
    })
}