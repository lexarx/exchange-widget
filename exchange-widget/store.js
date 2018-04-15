import { createStore as createReduxStore } from 'redux'
import { connect as reduxConnect } from 'react-redux'

const initialState = {};

function reducer(state = initialState, action) {
    if (typeof action.type === 'function') {
        return action.type(state, ...action.args);
    }

    return state;
}

export function createStore() {
    const store = createReduxStore(reducer);
    store.apply = function(transform) {
        const actionCreator = createActionCreator(transform);
        const action = actionCreator();
        store.dispatch(action);
    };
    return store;
}

export function connect(mapStateToProps, mapDispatchToProps) {
    const actionCreators = mapDispatchToProps && createActionCreators(mapDispatchToProps);
    return reduxConnect(mapStateToProps, actionCreators);
}

function createActionCreator(transform) {
    return function() {
        return {
            type: transform,
            args: arguments
        };
    };
}

function createActionCreators(transforms) {
    const actionCreators = {};
    for (const name in transforms) {
        actionCreators[name] = createActionCreator(transforms[name]);
    }
    return actionCreators;
}

export function update(state, properties) {
    return {
        ...state,
        ...properties
    };
}
