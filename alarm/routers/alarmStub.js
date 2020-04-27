const express = require('express');
const redis = require('redis');

const subscriber = redis.createClient();

const app = express();

subscriber.on("message",(channel,message) => {
    console.log("Received data :"+message);
})

subscriber.subscribe("user-notify");

subscriber.unsubscribe

app.get('/',(req,res) => {
    res.send("Subscriber One");
})

app.listen(3006,() => {
    console.log("server is listening to port 3006");
})