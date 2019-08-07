const methods = require('./methods');
const init = require('./init');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const history = require('connect-history-api-fallback');

const app = express();

// Middleware
// Do not use history middleware for /api/* paths
app.use(history({
    rewrites: [{
        from: /^\/api\/.*$/,
        to: (context) => context.parsedUrl.pathname
    }]
}));

app.use(express.static('dist'));
app.use(bodyParser.json({
    type: '*/json'
}));

// Any incoming data with image/any content-type header is not parsed to JSON
app.use(bodyParser.raw({
    type: 'image/*',
    limit: "10mb"
}));

app.use(compression());

// Methods
// Login
app.post('/api/login', async function (req, res) {
    const login = await methods.login(req);
    res.status(login.status).header(login.session ? {
        "set-cookie": login.session + "; SameSite=strict"
    } : {}).json(login.data);
});

// Registration API
app.put("/api/register", async function (req, res) {
    if (!req.body) {
        res.status(400).json({
            "error": "No data supplied",
            "message": "No data supplied"
        })
    } else {
        const registration = await methods.register(req);
        res.status(registration.status).json(registration.data);
    }
});

// Profile JSON data
app.get('/api/profile', async function (req, res) {
    const session = await methods.getSession(req);

    if (session.data.username) {
        const profile = await methods.getProfile(session.data.username);
        res.status(profile.status).header(profile.headers).json(profile.data);
    } else {
        res.status(session.status).json(session.data);
    }
});

// Session handling
app.get('/api/session', async function (req, res) {
    const session = await methods.getSession(req);
    res.status(session.status).json(session.data);
});

// Get content feed
// @param limit
// @param skip
// @param bookmark
app.get('/api/content', async function (req, res) {
    const content = await methods.getContentFeed(req)
    res.status(content.status).json(content.data);
})

// Get content by ID
// :id
app.get('/api/content/:id', async function (req, res) {
    const content = await methods.getContent(req);
    res.status(content.status).json(content.data);
});

app.delete('/api/logout', function (req, res) {
    res.status(200).header({
        "set-cookie": "AuthSession=; Max-Age=0; Path=/"
    }).json(true);
});

app.put('/api/avatar/:id', async function (req, res) {
    const avatar = await methods.addAvatar(req);
    res.status(avatar.status).json(avatar.data);
});

// Initialization scripts for the DB
init.initFunc(methods.auth);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Started server on on ${port}`);
});