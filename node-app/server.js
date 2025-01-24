'use strict'

const winston = require('winston');
require('dotenv').config();
require('./tracing'); // Add this line to initialize tracing
const express = require('express');
const morgan = require('morgan');
const pino = require('pino');
const axios = require('axios');
const promClient = require('prom-client');
const app = express();
const PORT = 9000;
const HOST = '0.0.0.0';
const OS = require('os');
const ENV = 'PROD';

const logger = pino();
const logging = () => {
    logger.info("Here are the logs")
    logger.info("Please have a look ")
    logger.info("This is just for testing")
}

app.use(morgan('common'))

const log = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '/var/log/app.log' }),
    ],
});

log.info('The server crash message sent to loki');

// Prometheus metrics
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code'],
});

const requestDurationHistogram = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.1, 0.5, 1, 5, 10], // Buckets for the histogram in seconds
});

const requestDurationSummary = new promClient.Summary({
    name: 'http_request_duration_summary_seconds',
    help: 'Summary of the duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    percentiles: [0.5, 0.9, 0.99], // Define your percentiles here
});



// Gauge metric
const gauge = new promClient.Gauge({
    name: 'node_gauge_example',
    help: 'Example of a gauge tracking async task duration',
    labelNames: ['method', 'status']
});

// Define an async function that simulates a task taking random time
const simulateAsyncTask = async () => {
    const randomTime = Math.random() * 5; // Random time between 0 and 5 seconds
    return new Promise((resolve) => setTimeout(resolve, randomTime * 1000));
};

app.disable('etag');

// Middleware to track metrics
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000; // Duration in seconds
        const { method, url } = req;
        const statusCode = res.statusCode; // Get the actual HTTP status code
        httpRequestCounter.labels({ method, path: url, status_code: statusCode }).inc();
        requestDurationHistogram.labels({ method, path: url, status_code: statusCode }).observe(duration);
        requestDurationSummary.labels({ method, path: url, status_code: statusCode }).observe(duration);
    });
    next();
});

// Default metrics (e.g., CPU, memory, etc.)
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register })


app.get('/app', (req, res) => {
    res.statusCode = 200;
    const msg = 'Welcome to Playa3ull!!!! games';
    res.send(getPage(msg));
});


app.get('/health', (req, res) => {
    res.status(200).json({
        name: "👀 - Obserability 🔥- Naveen",
        status: "health"
    })
});

app.get('/serverError', (req, res) => {
    res.status(500).json({
        error: " Internal server error",
        statusCode: 500
    })
});

app.get('/notFound', (req, res) => {
    res.status(404).json({
        error: "Not Found",
        statusCode: "404"
    })
});

app.get('/logs', (req, res) => {
    logging();
    res.status(200).json({
        objective: "To generate logs"
    })
});


// Simulate a crash by throwing an error
app.get('/crash', (req, res) => {
    res.send('Server crashing due to high load...!!!💥');
    process.exit(1);
});


// Define the /example route
app.get('/example', async (req, res) => {
    const endGauge = gauge.startTimer({ method: req.method, status: res.statusCode });
    await simulateAsyncTask();
    endGauge();
    res.send('Async task completed');
});


// Expose metrics for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Calling to test-app
app.get('/call-test-app', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.TEST_APP_URI}/hello`);
        res.send(`<h1 style="font-size: 100px">Test app says: ${response.data}<h1>`);
    } catch (error) {
        res.status(500).send('Error communicating with Test app');
    }
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