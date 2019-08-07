const axios = require('axios');
const jimp = require('jimp');

const baseUrl = process.env.COUCH_HOST || "http://couch:5984"

const couchResp = (resp) => ({
    status: resp.status,
    data: resp.data
})

const couchErr = (err) => {
    return {
        status: err.response.status || 500,
        data: err.response.data || {
            error: "unknown",
            message: "unknown"
        },
        headers: err.response.headers || {}
    }
}

const auth = {
    username: process.env.COUCHDB_USER || "midas",
    password: process.env.COUCHDB_PASSWORD || "alcatraz"
}
const couchProfileMeta = ["_id", "_rev", "_attachments", "type", "roles", "password_scheme", "iterations", "derived_key", "salt"];
const couchContentMeta = ["_id", "_rev"]

function filterKeys(object, keys) {
    return Object.keys(object)
        .filter(key => !keys.includes(key))
        .reduce((acc, key) => {
            acc[key] = object[key];
            return acc;
        }, {})
}

function login(req) {
    return axios({
            method: "post",
            url: baseUrl + "/_session",
            auth: auth,
            data: req.body,
        }).then(resp =>
            ({
                session: resp.headers["set-cookie"][0],
                status: resp.status,
                data: resp.data
            }))
        .catch(couchErr);
}

function getSession(req) {
    const cookie = req.headers.cookie;
    return axios({
            method: "get",
            url: baseUrl + "/_session",
            headers: {
                cookie: cookie ? cookie : ""
            }
        }).then(resp => ({
            status: 200,
            data: {
                ok: resp.data.ok,
                username: resp.data.userCtx.name
            }
        }))
        .catch(couchErr);
}

function getProfile(username) {
    const url = baseUrl + "/_users/org.couchdb.user:" + username

    const profile = axios.get(url, {
        auth
    }).then(resp => ({
        status: resp.status,
        data: filterKeys(resp.data, couchProfileMeta),
        headers: resp.headers
    }))

    const avatar = axios.get(url + "/avatar.jpeg", {
        auth,
        responseType: 'arraybuffer'
    }).then(resp => resp.data.toString('base64')).catch(err => {
        return ""
    })

    return Promise.all([profile, avatar]).then((res) => ({
        data: {
            profile: res[0].data,
            avatar: res[1]
        },
        status: res[0].status,
        headers: res[0].headers
    })).catch(err => {
        return {
            status: 500,
            headers: {},
            data: {}
        }
    });
}

function getContentFeed(req, q) {
    const cookie = req.headers.cookie;

    return axios({
        method: "post",
        url: baseUrl + "/content/_find",
        headers: {
            cookie: cookie ? cookie : ""
        },
        data: {
            selector: {},
            fields: [
                "id",
                "createdAt",
                "createdBy",
                "title",
                "text"
            ],
            sort: [{
                "createdAt": "desc"
            }],
            execution_stats: false,
            ...q
        }
    }).then(couchResp).catch(couchErr)
}

function getContent(req) {
    const cookie = req.headers.cookie;

    return axios({
        method: "get",
        url: baseUrl + "/content/" + req.params.id,
        headers: {
            cookie: cookie ? cookie : ""
        }
    }).then(resp => ({
        status: resp.status,
        data: filterKeys(resp.data, couchContentMeta)
    })).catch(couchErr)
}

function register(req) {
    const dbId = "org.couchdb.user:" + req.body.name;
    const profile = {
        ...req.body,
        type: "user",
        roles: []
    }

    return axios({
        method: "put",
        url: baseUrl + "/_users/" + dbId,
        auth: auth,
        data: profile
    }).then(couchResp).catch(couchErr);
}

function getAvatar(req) {
    const url = baseUrl + "/_users/org.couchdb.user:" + req.params.id + "/avatar.jpeg";
    return axios.get(url, {
        auth,
        headers: req.headers,
        responseType: 'arraybuffer'
    }).then(resp => ({
        status: resp.status,
        data: resp.data,
        headers: resp.headers
    })).catch(err => ({
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers
    }))
}

async function addAvatar(req) {
    const baseImg = await jimp.read(req.body)
        .then(img => {
            const imgWidth = img.getWidth()
            return imgWidth > 1000 ?
                img.resize(1000, img.getHeight() * 1000 / imgWidth).getBufferAsync(jimp.MIME_JPEG) :
                img.getBufferAsync(jimp.MIME_JPEG)
        });
    const url = baseUrl + "/_users/" + req.params.id + "/avatar.jpeg";

    return axios({
        method: "put",
        url,
        auth,
        data: baseImg,
        maxContentLength: 10 * 1024 * 1024,
        headers: {
            ...req.headers,
            'content-type': 'image/jpeg'
        }
    }).then(couchResp).catch(couchErr)
}


module.exports = {
    auth,
    login,
    getSession,
    getProfile,
    getContentFeed,
    getContent,
    register,
    getAvatar,
    addAvatar
}