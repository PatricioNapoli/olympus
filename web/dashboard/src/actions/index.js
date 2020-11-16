import axios from "axios";

export function buildUrl(url) {
    return `${url}`;
}

export function putData(call, section, sc, fc) {
  return (dispatch) => {
    dispatch(baseResetRequestState(section));
    apiPut(dispatch, call, section, sc, fc);
  };
}

export function postData(call, section, sc, fc) {
  return (dispatch) => {
    //dispatch(baseResetRequestState(section));
    apiPost(dispatch, call, section, sc, fc);
  };
}

export function getData(calls, section) {
  return (dispatch) => {
    dispatch(baseResetRequestState(section));
    recursiveApiFetch(dispatch, calls, section);
  };
}

export function handleClientError(error, errorInfo, section) {
  return (dispatch) => {
  };
}

export function setWindowSize(width, height, section) {
  return (dispatch) => {
    dispatch(baseWindowResize(width, height, section));
  };
}

function apiPut(dispatch, call, section, sc, fc) {
  axios.put(buildUrl(call.url), call.data)
    .then(function (response) {
      if (response.status !== 200)
        throw Error(response.statusText);

      if (sc)
        sc();
    }).catch((error) => handleNetworkError(dispatch, error, section, fc));
}

function apiPost(dispatch, call, section, sc, fc) {
  axios.post(buildUrl(call.url), call.data)
    .then(function (response) {
      if (response.status !== 201)
        throw Error(response.statusText);

      if (sc)
        sc();
      
      //dispatch(baseRequestFinished({}, section));
    }).catch((error) => handleNetworkError(dispatch, error, section, fc));
}

const networkDownloadProgress = (progressEvent, dispatch) => {
  let total = progressEvent.total;
  let loaded = progressEvent.loaded;

  let progress = Math.round((loaded / total) * 100);

  dispatch(baseLoadingProgress(progress, 'site'));
}

function recursiveApiFetch(dispatch, calls, section, prevState = {}) {
  axios.get(buildUrl(calls.url), { onDownloadProgress: (progress) => networkDownloadProgress(progress, dispatch) })
    .then(function (response) {
      if (response.status !== 200)
        throw Error(response.statusText);

      const state = prevState;
      state[calls.respKey] = response.data;

      if (calls.next) {
        dispatch(baseLoadingProgress(0, 'site'));
        recursiveApiFetch(dispatch, calls.next, section, state);
        return
      }

      dispatch(baseRequestFinished(state, section));

    }).catch((error) => handleNetworkError(dispatch, error, section));
}

function handleNetworkError(dispatch, error, section, fc) {
  dispatch(baseLoadingProgress(100, 'site'));

  dispatch(baseHasErrored(error.message, section));

  if (fc)
    fc();
}

function baseRequestFinished(data, section) {
  return {
    type: 'REQUEST_FINISHED',
    section: section,
    isLoading: false,
    lastUpdated: Date.now(),
    data
  };
}

function baseResetRequestState(section) {
  return {
      type: 'RESET_REQUEST_STATE',
      section: section,
      isLoading: true,
      hasErrored: ""
    };
} 

function baseHasErrored(bool, section) {
  return {
    type: 'HAS_ERRORED',
    section: section,
    hasErrored: bool
  };
}

function baseLoadingProgress(progress, section) {
  return {
    type: 'LOADING_PROGRESS',
    section: section,
    loadingProgress: progress
  };
}

function baseWindowResize(width, height, section) {
  return {
    type: 'WINDOW_RESIZE',
    section: section,
    width: width,
    height: height
  };
}