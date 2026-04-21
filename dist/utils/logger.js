import * as core from "@actions/core";
function formatDetails(details) {
    if (!details || Object.keys(details).length === 0) {
        return "";
    }
    return ` ${JSON.stringify(details)}`;
}
export const logger = {
    info(message, details) {
        core.info(`${message}${formatDetails(details)}`);
    },
    warning(message, details) {
        core.warning(`${message}${formatDetails(details)}`);
    },
    error(message, details) {
        core.error(`${message}${formatDetails(details)}`);
    },
};
