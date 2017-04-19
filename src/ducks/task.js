import { combineReducers } from 'redux';

// const STUB = [
//   {
//     task_family: 'Eaf dictionary conversion',
//     task_details: "Grigorovski's dictionary",
//     status: 'Finished',
//     key: 'task:88d21421-a94b-4155-bd81-5062d7f7c528',
//     progress: 100,
//     result_link: '',
//     id: '88d21421-a94b-4155-bd81-5062d7f7c528',
//     current_stage: 10,
//     user_id: '5',
//     total_stages: 10,
//   },
//   {
//     task_family: 'Phonology compilation',
//     task_details: 'Dictionary of Forest dialect of Enets Language: Lexical Entries',
//     status: 'Finished',
//     key: 'task:3814c79f-0c5b-4f5f-8533-c312d82196cc',
//     progress: 100,
//     result_link: 'http://lingvodoc.ispras.ru/objects/phonology/1492532038.5902135/Dictionary of Forest dialect of Enets Language - Lexical Entries - 2017.04.18.xlsx',
//     id: '3814c79f-0c5b-4f5f-8533-c312d82196cc',
//     current_stage: 4,
//     user_id: '5',
//     total_stages: 4,
//   },
//   {
//     task_family: 'Eaf dictionary conversion',
//     task_details: "Grigorovski's dictionary",
//     status: 'Finished',
//     key: 'task:afeeac56-6a14-418d-886c-68d34c18e58c',
//     progress: 100,
//     result_link: '',
//     id: 'afeeac56-6a14-418d-886c-68d34c18e58c',
//     current_stage: 10,
//     user_id: '5',
//     total_stages: 10,
//   },
//   {
//     task_family: 'Eaf dictionary conversion',
//     task_details: "Grigorovski's dictionary",
//     status: 'Finished',
//     key: 'task:9c676782-ba61-430b-9a46-b265c33bd91a',
//     progress: 100,
//     result_link: '',
//     id: '9c676782-ba61-430b-9a46-b265c33bd91a',
//     current_stage: 10,
//     user_id: '5',
//     total_stages: 10,
//   },
// ];

// Actions
const REQUEST = '@task/REQUEST';
const TOGGLE = '@task/TOGGLE';
const SET = '@task/SET';

// Reducers
function tasks(state = [], action = {}) {
  switch (action.type) {
    case SET:
      return action.payload;
    default:
      return state;
  }
}

function visible(state = false, action = {}) {
  switch (action.type) {
    case TOGGLE:
      return !state;
    default:
      return state;
  }
}

function loading(state = false, action = {}) {
  switch (action.type) {
    case REQUEST:
      return true;
    case SET:
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  tasks,
  visible,
  loading,
});

// Action Creators
export function requestTasks() {
  return { type: REQUEST };
}

export function toggleTasks() {
  return { type: TOGGLE };
}

export function setTasks(payload) {
  return { type: SET, payload };
}
