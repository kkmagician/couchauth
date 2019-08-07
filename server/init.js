const axios = require("axios");
const fs = require("fs");

const baseUrl = process.env.COUCH_HOST || "http://couch:5984"
const nodename = process.env.NODENAME || "couchauth"
const initRetries = parseInt(process.env.INIT_RETRIES) || 5

function sleep(ms) {
    return new Promise(r => {
        setTimeout(r, ms)
    })
}

function resolveAll(promises) {
    return Promise.all(promises)
        .then(res => res.reduce((a, b) => a && b))
}

const checkCouch = (auth) => {
    return axios.get(baseUrl, {
        auth
    }).then(() => true).catch(() => false)
}

const putDb = (name, auth) => {
    return axios.put(baseUrl + "/" + name, {}, {
            auth
        })
        .then(resp => resp.status < 300 ? true : false)
        .catch(err => err.response.status == 412 ? true : false)
        .catch(false)
}

const changeSetting = (setting, value, auth) => {
    var value = '"' + value + '"'
    return axios({
            method: "put",
            url: baseUrl + `/_node/couchdb@${nodename}/_config/` + setting,
            data: value,
            auth: auth,
            headers: {
                'Content-Type': 'text/plain'
            }
        })
        .then(resp => resp.status < 300 ? true : false)
        .catch(err => {
            console.log(err.response.data);
            return false
        })
}

const toCouch = (method, location, data, ok, auth) => {
    const url = baseUrl + location + (data.id ? "/" + data.id : "");
    return axios({
            method,
            url,
            data,
            auth
        })
        .then(resp => resp.status < 300 ? true : false)
        .catch(err => ok.includes(err.response.status) ? true : false)
        .catch(false)
}

// Initialization of CouchDB function
async function initFunc(auth) {
    // Check if Couch is online and ready to receive calls
    for (var i = initRetries; i > 0; i--) {
        var initOk = await checkCouch(auth)
        if (initOk) break
        await sleep(5000)
        console.log("Could not send init requests\nRetry #" + (initRetries - i + 1));
    }

    if (i == 0) {
        console.log("All retries have failed, abort mission.");
        process.exit(1);
    }

    // Init all the DBs
    const dbs = ["_users", "_global_changes", "_replicator", "content"].map(db => putDb(db, auth))
    const dbsOk = await resolveAll(dbs)

    if (!dbsOk) {
        console.log("Could not create databases, abort mission");
        process.exit(1);
    }

    // Change settings
    const settings = [{
            setting: "httpd/bind_address",
            value: "127.0.0.1"
        },
        {
            setting: "chttpd/require_valid_user",
            value: "true"
        },
        {
            setting: "couch_httpd_auth/require_valid_user",
            value: "true"
        },
        {
            setting: "couch_httpd_auth/auth_cache_size",
            value: process.env.AUTH_CACHE_SIZE || "50"
        },
        {
            setting: "couch_httpd_auth/timeout",
            value: process.env.SESSION_INVALIDATION_TIMEOUT || "600"
        },
        {
            setting: "couch_httpd_auth/allow_persistent_cookies",
            value: process.env.PERSISTENT_COOKIES || "false"
        }
    ].map(set => changeSetting(set.setting, set.value, auth));

    const settingsOk = await resolveAll(settings);

    if (!settingsOk) {
        console.log("Could not change default settings, abort mission");
        process.exit(1);
    }

    // Upload sample content
    const contentUpload = JSON.parse(fs.readFileSync("assets/content.json")).map(
        (el) => toCouch("put", "/content", el, [409], auth)
    );

    const contentOk = await resolveAll(contentUpload);

    if (!contentOk) {
        console.log("Could not upload all the content, abort mission");
        process.exit(1);
    }

    // content DB date index
    const contentIdx = await toCouch("post", "/content/_index", {
        index: {
            fields: [{
                createdAt: "desc"
            }]
        }
    }, [0], auth);

    if (!contentIdx) {
        console.log("Could not create the index for content DB, abort mission");
        process.exit(1);
    }

    // Dummy profile for the admin user
    const dummyProfile = await toCouch(
        "put",
        `/_users/org.couchdb.user:${auth.username}`, {
            name: auth.username,
            firstName: auth.username.toUpperCase(),
            lastName: auth.username.toUpperCase(),
            roles: [],
            type: "user"
        }, [409], auth
    );

    if (!dummyProfile) {
        console.log("Could not create dummy profile for admin, aborting");
        process.exit(1);
    }

    // Sync finish
    console.log("Init is successfull!");
    return;
}

module.exports = {
    initFunc
}