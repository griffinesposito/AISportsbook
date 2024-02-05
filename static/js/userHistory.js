import { wrappedFetchLeagueEvents, wrappedFetchTeams, wrappedFetchSearchResults, getCallFuture, getCallHistory, recordCall, recordFuture } from './fetchLeagueEvents.js';
// Assume this map exists and maps string identifiers to actual function references
const functionMap = {
    wrappedFetchLeagueEvents  : wrappedFetchLeagueEvents, 
    wrappedFetchTeams         : wrappedFetchTeams, 
    wrappedFetchSearchResults : wrappedFetchSearchResults, 
};

export function replayAndRemoveLastCall() {
    const callHistory = getCallHistory();
    if (callHistory.length === 0) {
        console.log("No calls in history to replay.");
        return;
    }

    // Retrieve the last call
    const lastCall = callHistory.pop(); // This removes the last element from the array

    // Get the function reference from the functionMap
    const funcToCall = functionMap[lastCall.functionName];

    if (funcToCall) {
        // Call the function with the original arguments
        funcToCall(...lastCall.args);
    } else {
        console.error(`Function ${lastCall.functionName} not found.`);
    }
    recordFuture(lastCall.functionName,lastCall.args);
}

export function replayAndRemoveNextCall() {
    const callFuture = getCallFuture();
    if (callFuture.length === 0) {
        console.log("No calls in history to replay.");
        return;
    }

    // Retrieve the last call
    const nextCall = callFuture.pop(); // This removes the last element from the array

    // Get the function reference from the functionMap
    const funcToCall = functionMap[nextCall.functionName];

    if (funcToCall) {
        // Call the function with the original arguments
        funcToCall(...nextCall.args);
    } else {
        console.error(`Function ${nextCall.functionName} not found.`);
    }
    recordCall(nextCall.functionName,nextCall.args);
}