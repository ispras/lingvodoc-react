import { combineReducers } from "redux";

import ducks from "./ducks";

export default combineReducers({ ...ducks });
