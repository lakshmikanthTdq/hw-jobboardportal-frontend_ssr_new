// server.js
import fs from 'fs';
import path from 'path';
import React from 'react';
import express from 'express';
import { Provider } from 'react-redux';
import ReactDomServer from 'react-dom/server';
import { CacheProvider } from '@emotion/react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { StaticRouter } from 'react-router-dom/server';
import createEmotionServer from '@emotion/server/create-instance';
import fetch from 'node-fetch';

import App from './client/App';
import { store } from './client/store';
import createEmotionCache from './createEmotionCache';
import PageNotFound from './client/pages/PageNotFound/PageNotFound';
import { decryptParams, parseParamsString } from './client/_utilities/Encrypt_decrypt';

const app = express();
const PORT = process.env.PORT || 3006;

app.use('/static', express.static(path.resolve('dist')));

const renderReactApp = async (req, res) => {
    const helmetContext = {};
    const emotionCache = createEmotionCache();
    const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(emotionCache);

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const match = req.url.match(/jobdetails\/([^/?]+)/);
    let encryptUrl = match?.[1];
    let job = undefined;
    if (encryptUrl) {
        const decryptedValue = decryptParams(encryptUrl);
        const parsedParams = parseParamsString(decryptedValue);
        if (parsedParams) {
            const apiRes = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening/${parsedParams.jobfeedId}`, {
                method: "GET",
                headers: { 'Countryid': parsedParams.countryId, "Customerid": parsedParams.customerId, "Portaltype": "JBPortal" }
            });
            const imgRes = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/jobBoard`, {
                method: "GET",
                headers: { "Content-Type": "Application/json", "customerId": parsedParams.customerId },
            });
            const jsonData = await apiRes.json();
            const JsonImgData = await imgRes.json();
            const myData = jsonData.data[0];
            if (jsonData.code === 200) {
                myData.jobType = (myData.jobType.split(",")).join(", ");
                job = myData;
                if (JsonImgData?.Data?.jobBoard.length > 0) {
                    let newData = JsonImgData.Data.jobBoard.filter(x => parseInt(x.segmentId) === parseInt(parsedParams.segmentId))[0];
                    newData['preview'] = newData.logo ? newData.logo.substring(newData.logo.lastIndexOf("/") + 1) : "/static/assests/img/HireWingBw.png";
                    job['logoUrl'] = '/static/assests/img/HireWingBw.png';
                    if (!newData.logo.includes("s3.ap-south-2.amazonaws.com")) {
                        const res1 = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/previewDocument`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "customerId": parsedParams.customerId,
                            },
                            body: JSON.stringify({ path: newData.logo }),
                        });
                        const docData = await res1.json();
                        if (docData.code === 200 && docData.path) {
                            newData.logo = docData.path;
                            job['logoUrl'] = docData.path;
                        }
                    } else if (newData.logo.includes("s3.ap-south-2.amazonaws.com")) {
                        newData.logo = newData.logo;
                        job['logoUrl'] = newData.logo;
                    }
                }
            }
        }
    }
if (!job) {
    job = {
        jobTitle: 'Job Not Found',
        customerName: 'Unknown',
        jobDesc: 'This job may have been removed.',
        jobType: '',
        location: '',
        createdAt: new Date().toISOString()
    };
}

const reactHtml = ReactDomServer.renderToString(
    <StaticRouter location={req.url}>
        <HelmetProvider context={helmetContext}>
            <CacheProvider value={emotionCache}>
                <Provider store={store}>
                    <ErrorBoundary FallbackComponent={PageNotFound}>
                        <App url={fullUrl} job={job} />
                    </ErrorBoundary>
                </Provider>
            </CacheProvider>
        </HelmetProvider>
    </StaticRouter>
);

const emotionChunks = extractCriticalToChunks(reactHtml);
const emotionCss = constructStyleTagsFromChunks(emotionChunks);
const { helmet } = helmetContext;

const indexHtml = await fs.promises.readFile(
    path.resolve('dist', 'index.html'),
    'utf-8'
);

const renderedApp = indexHtml
    .replace('<style></style>', emotionCss)
    .replace('<title></title>', `${helmet.title.toString()}${helmet.meta.toString()}`)
    .replace("<div id='root'></div>", `<div id='root'>${reactHtml}</div>`);

res.status(200).send(renderedApp);
};

app.use(renderReactApp);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
