class http {
	constructor(baseUrl) {
		if (baseUrl != undefined) {
			this.baseUrl = baseUrl;
		} else {
			this.baseUrl = sessionStorage.getItem("http")
		}
	}
	request({ metodo = 'GET', path = null, headers = null, data = null, body = null , dataType = null, stringify=true}) {
		if (path == undefined) {
			return "path vazio"
		}

		if (data == undefined || data == false) {
			data = "";
		}

		if (headers == undefined || headers == false) {
			var token = sessionStorage.getItem("token")
			var token_level = sessionStorage.getItem("token_level")
			if (token == null) {
				headers = {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT',
					'Content-Type': 'application/json'
				}
			} else {
				headers = {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT',
					'Content-Type': 'application/json',
					'Authorization': 'JWT ' + token,
					'level_token': token_level,
				}
			}

		} else {
			headers = headers
		}
		var resposta;

		if(stringify){
			data = JSON.stringify(data),
			body = JSON.stringify(body)
		}

		var settings = {
			"url": this.baseUrl + path,
			"method": metodo,
			"timeout": 0,
			"async": false,
			"headers": headers,
			"data": data,
			"body": body,
			"dataType" : dataType
		};
		$.ajax(settings)
			.done(function (data, status, response) {
				resposta = { data, status, response }
			})
			.fail(function (jqXHR, textStatus, msg) {
				// console.log(jqXHR.status);
				// console.log(textStatus);
				// console.log(msg);
				if (jqXHR.status == 419) {
					deslogar()
				}
				var message = jqXHR?.responseJSON
				if(message?.desloga){
					alertas(message.message)
					deslogar()
				}
				resposta = { message, textStatus, msg }
			});
		return resposta;
	}
}
ip = window.location.href
$('head').append(`<base href="${ip}" target="_blank"></base>`)
http = new http(ip)
