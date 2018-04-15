import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from './store'
import ExchangeWidgetComponent from './exchange-widget-component'

export default class ExchangeWidget {
    constructor() {
        this.store = createStore();
    }

    setBalances(balances) {
        this.store.apply(state => {
            const newState = { ...state, balances };
            if (!newState.sourceCurrency) {
                newState.sourceCurrency = balances[0].currency;
                newState.targetCurrency = balances[1].currency;
            }
            return newState;
        });
    }

    render(container) {
        if (this.rendered) {
            throw new Error('The widget is already rendered.');
        }

        render(
            <Provider store={this.store}>
                <ExchangeWidgetComponent />
            </Provider>,
            container
        );
        this.container = container;
        this.rendered = true;
    }

    destroy() {
        unmountComponentAtNode(this.container);
    }
}
