const sliding = (arr, n) => {
    var acc = [];
    var add = [];
    for (var i = 0; i < arr.length; i++) {
        if (i % n == (n - 1)) {
            acc = [...acc, [...add, arr[i]]]
            add = []
        } else {
            add = [...add, arr[i]]
        }
    }
    return acc;
}

function splitByteArray(arr, sep, adj, limit) {
    adj = adj || 0; // set overflow adjusted to CRLF bytes (0d 0a / 13 10)
    limit = limit || Infinity;

    var idxs = []
    var idx = arr.indexOf(sep);
    while (idx != -1 && limit > 0) {
        limit -= 1;
        idxs = [...idxs, [idx > adj ? idx - adj : 0, idx + sep.length + adj]];
        idx = arr.indexOf(sep, idx + sep.length);
    }

    if (idxs.length == 0) return [arr];

    var idxsFlat = idxs.reduce((start, end) => [...start, ...end])

    if (idxsFlat.includes(0)) idxsFlat = idxsFlat.slice(1)
    if (idxsFlat.includes(idxs.length)) idxsFlat = idxsFlat.slice(0, -1)

    if (idxsFlat.length > 2) {
        return sliding(idxsFlat, 2).map(el => arr.slice(el[0], el[1]));
    } else if (idxsFlat.length == 2) {
        return [arr.slice(0, idxsFlat[0]), arr.slice(idxsFlat[1])]
    } else {
        return [arr];
    }
}

export const parseMultipart = (resp, contentMappers) => {
    const boundary = "--" + resp.headers["content-type"].split('"', 2)[1];
    const boundBuf = new Buffer.from(boundary);
    const csrf = new Buffer.from([13, 10]);
    const csrf2 = new Buffer.from([13, 10, 13, 10]);

    var arr =
        splitByteArray(new Buffer.from(resp.data), boundBuf, 2)
        .map(el => splitByteArray(el, csrf2, 0, 1)) // limit by meta and data to prevent unnecessary scans
        .map(el => ({
            meta: splitByteArray(el[0], csrf)
                .map(m => m.toString())
                .map(h => h.split(": ", 2))
                .reduce((acc, add) => {
                    acc[add[0].toLowerCase()] = add[1];
                    return acc;
                }, {}),
            data: el[1]
        }));

    if (contentMappers) {
        arr = arr.map(att => {
            const mapper = contentMappers[att.meta['content-type']];
            return mapper ? {
                meta: att.meta,
                data: mapper(att.data)
            } : att
        })
    }

    return arr

}

export const formatDate = (date) => {
    return new Date(date).toUTCString().split(", ")[1].slice(0, -7)
}