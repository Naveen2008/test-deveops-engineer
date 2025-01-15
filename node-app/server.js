'use strict'

const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 9000;
const HOST = '0.0.0.0';
const OS = require('os');
const ENV = 'PROD';


// Default metrics (e.g., CPU, memory, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register })


app.get('/', (req, res) => {
    res.statusCode = 200;
    const msg = 'Hello from from Playa3ull!!!!';
    res.send(getPage(msg));
});

app.get("/metrics", async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics)
})

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function getPage(message) {

    let body = "<!DOCTYPE html>\n"
        + "<html>\n"
        + "<style>\n"
        + "body, html {\n"
        + "  height: 100%;\n"
        + "  margin: 0;\n"
        + "}\n"
        + "\n"
        + ".bgimg {\n"
        + "  background-image: url('https://codetheweb.blog/assets/img/posts/css-advanced-background-images/mountains.jpg');\n"
        + "  height: 100%;\n"
        + "  background-position: center;\n"
        + "  background-size: cover;\n"
        + "  position: relative;\n"
        + "  color: white;\n"
        + "  font-family: \"Courier New\", Courier, monospace;\n"
        + "  font-size: 25px;\n"
        + "}\n"
        + "\n"
        + ".topleft {\n"
        + "  position: absolute;\n"
        + "  top: 0;\n"
        + "  left: 16px;\n"
        + "}\n"
        + "\n"
        + ".bottomleft {\n"
        + "  position: absolute;\n"
        + "  bottom: 0;\n"
        + "  left: 16px;\n"
        + "}\n"
        + "\n"
        + ".middle {\n"
        + "  position: absolute;\n"
        + "  top: 50%;\n"
        + "  left: 50%;\n"
        + "  transform: translate(-50%, -50%);\n"
        + "  text-align: center;\n"
        + "}\n"
        + "\n"
        + "hr {\n"
        + "  margin: auto;\n"
        + "  width: 40%;\n"
        + "}\n"
        + "</style>\n"
        + "<body>\n"
        + "\n"
        + "<div class=\"bgimg\">\n"
        + "  <div class=\"topleft\">\n"
        + "    <p>ENVIRONMENT: " + ENV + "</p>\n"
        + "  </div>\n"
        + "  <div class=\"middle\">\n"
        + "    <h1>Host/container name</h1>\n"
        + "    <hr>\n"
        + "    <p>" + OS.hostname() + "</p>\n"
        + "  </div>\n"
        + "  <div class=\"bottomleft\">\n"
        + "    <p>" + message + "</p>\n"
        + "  </div>\n"
        + "</div>\n"
        + "\n"
        + "</body>\n"
        + "</html>\n";
    return body;
}