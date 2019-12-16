const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/wh-event-listener', (req, res) => {
	console.log("Channel URL: " + req.body.channel.channel_url);
	
	let applicationId = 'EE22FCF6-E21A-4073-A0A5-49C7EC113564';
	let channelUrl = req.body.channel.channel_url;
	let channelType = 'group_channels';
	
	let bodyString = JSON.stringify(req.body).replace(/\//g,'\\/');
	
	let masterToken = "";
	
	/*
		The following hash computation and if-else block is a part of bonus task. Hash is calculated masterToken, that
		we got from sendbird. If calculated hash is equal x-send-bird-signature then it means the request is from right source
		i-e from sendbird.		
	*/
	
	const hash = crypto.createHmac('sha256', masterToken)
	.update(bodyString)
	.digest('hex')
	
	if (hash != req.headers['x-sendbird-signature']) {
		console.log("********wrong source**************");
		res.send({"error" : true, "msg" : "request from source that is not allowed"});
		return;
	}
	else {
		console.log("**********right source***********");
	}
	
	
	let messageBody = {
		"content" : "You miss 100% of the shots you don't take - Wayne Gretzky",
		"author" : "Michael Scott"
	}
	
	let message = {
		"message_type" : "ADMM", // ADMM means message is of type admin
		"message_id" : "arnon" + Date.now().toString(),
		"message" : JSON.stringify(messageBody),
		"created_at" : Date.now().toString()
	}
	
	fetch(`https://api-${applicationId}.sendbird.com/v3/${channelType}/${channelUrl}/messages`, {
		method : 'post',
		headers : {
			'Content-type' : 'application/json',
			"Api-Token" : masterToken
		},
		body : JSON.stringify(message)
	}).then(res_ => {
		res.send({"status" : "ok"});
	}).catch(err => {
		res.send({"status" : "error"});
	});
});

app.listen(process.env.PORT || 3003);