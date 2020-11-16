import { combineReducers } from 'redux';

function getDefaultState(section) {
  return {
    isLoading: false,
    loadingProgress: 100,
    loadingTotal: 100,
    hasErrored: "",
    lastUpdated: Date.now(),
    section: section,
    data: {}
  }
}

const stateAwareComponents = [
  'site',
  'home',
  'profile'
]

function getInitialState() {
  let state = {};

  for (let i = 0; i < stateAwareComponents.length; i++)
    state[stateAwareComponents[i]] = getDefaultState(stateAwareComponents[i]);

  state.site.windowWidth = 1024;
  state.site.windowHeight = 768;

  return state;
}

export function base(state = getInitialState(), action) {
  if (action.section !== undefined && state[action.section] === undefined)
    state[action.section] = {};

  let newState = Object.assign({}, state);

  if (action.section !== undefined)
    newState[action.section] = Object.assign({}, state[action.section]);

  let sectionState = newState[action.section];

  switch (action.type) {
    case 'REQUEST_FINISHED':
      sectionState.lastUpdated = action.lastUpdated;
      sectionState.isLoading = action.isLoading;
      sectionState.data = action.data;
      return newState;
    case 'RESET_REQUEST_STATE':
      sectionState.isLoading = action.isLoading;
      sectionState.hasErrored = action.hasErrored;
      return newState;
    case 'HAS_ERRORED':
      sectionState.hasErrored = action.hasErrored;
      return newState;
    case 'LOADING_PROGRESS':
      sectionState.loadingProgress = action.loadingProgress;
      return newState;
    case 'WINDOW_RESIZE':
      sectionState.windowWidth = action.width;
      sectionState.windowHeight = action.height;
      return newState;
    default:
      return state;
  }
}

export default combineReducers({
  base
});
