
//Récupération token implicite
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
      results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function getTokenImplicit(){
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

    location.hash='';

  }
  else {
    var queryStringData = {
        response_type : "token",
        client_id : "57ccf1ac-a77a-4c53-995e-d76ca9d4fc0f",
        redirect_uri : "https://dev.d1gtoz2fo9jrqa.amplifyapp.com/"
    }

    window.location.replace("https://login.mypurecloud.de/oauth/authorize?" + jQuery.param(queryStringData));
  }
}
