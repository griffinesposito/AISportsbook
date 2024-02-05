import { wrappedFetchLeagueEvents, wrappedFetchTeams, wrappedFetchSearchResults } from './fetchLeagueEvents.js';
// Assume this map exists and maps string identifiers to actual function references
const functionMap = {
    wrappedFetchLeagueEvents  : wrappedFetchLeagueEvents, 
    wrappedFetchTeams         : wrappedFetchTeams, 
    wrappedFetchSearchResults : wrappedFetchSearchResults, 
};
// Define an array to hold the history of function calls
const callHistory = [];
const callFuture  = [];

// Function to record a call
export function recordCall(functionName, args) {
    callHistory.push({ functionName: functionName, args: Array.from(args) });
}

// Function to record a call
export function recordFuture(functionName, args) {
    callFuture.push({ functionName: functionName, args: Array.from(args) });
}

// Exported function to get the call history
export function getCallHistory() {
    return callHistory;
}

// Exported function to get the call history
export function getCallFuture() {
    return callFuture;
}
export function replayAndRemoveLastCall() {
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
        console.log("Call History", callHistory);
    } else {
        console.error(`Function ${lastCall.functionName} not found.`);
    }
    recordFuture(lastCall.functionName,lastCall.args);
}

export function replayAndRemoveNextCall() {
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