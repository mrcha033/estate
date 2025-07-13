"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const analytics_node_1 = require("@segment/analytics-node");
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || '';
let analytics = null;
const getAnalytics = () => {
    if (!analytics) {
        analytics = new analytics_node_1.Analytics({
            writeKey: SEGMENT_WRITE_KEY,
        });
    }
    return analytics;
};
exports.getAnalytics = getAnalytics;
