import React from 'react'
import { connect, update } from './store'
import ExchangeElement from './exchange-element'
import ExchangeRate from './exchange-rate'
import ExchangeRateUpdater from './exchange-rate-updater'
import styles from './exchange-widget.css'

class ExchangeWidgetComponent extends React.Component {
    render() {
        return (
            <div className={styles.exchangeWidget}>
                <div className={styles.top}>
                    <ExchangeElement
                        source={true}
                        currency={this.props.sourceCurrency}
                        amount={this.props.sourceAmount}
                        balance={this.props.sourceBalance}
                        fee={!this.props.offer && this.props.fee}
                        setCurrency={this.setSourceCurrency.bind(this)}
                        setAmount={this.setSourceAmount.bind(this)}
                    />
                    <div className={styles.separator}>
                        <div className={styles.swap} onClick={this.swap.bind(this)}></div>
                        <ExchangeRate
                            sourceCurrency={this.props.sourceCurrency}
                            targetCurrency={this.props.targetCurrency}
                            rate={this.props.rate}
                        />
                    </div>
                    <ExchangeElement
                        currency={this.props.targetCurrency}
                        amount={this.props.targetAmount}
                        balance={this.props.targetBalance}
                        fee={this.props.offer && this.props.fee}
                        setCurrency={this.setTargetCurrency.bind(this)}
                        setAmount={this.setTargetAmount.bind(this)}
                    />
                </div>
                <div className={styles.bottom}>
                    <button
                        className={styles.exchangeButton}
                        disabled={!this.canExchange()}
                        onClick={this.props.exchange}
                    >Exchange</button>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.getExchangeRate();
    }

    componentDidUpdate() {
        this.getExchangeRate();
    }

    componentWillUnmount() {
        if (this.exchangeRateUpdater) {
            this.exchangeRateUpdater.stop();
        }
    }

    canExchange() {
        const sourceAmount = convertToNumber(this.props.sourceAmount);
        return sourceAmount && sourceAmount <= this.props.sourceBalance && this.props.rate;
    }

    setSourceCurrency(sourceCurrency) {
        const state = {
            sourceCurrency,
            rate: undefined
        };
        if (sourceCurrency === this.props.targetCurrency) {
            state.targetCurrency = this.props.sourceCurrency;
        }
        this.props.update(state);
    }

    setSourceAmount(sourceAmount) {
        const state = {
            sourceAmount,
            offer: true
        };
        if (!sourceAmount) {
            state.targetAmount = undefined;
            state.fee = undefined;
        }
        this.props.update(state);
    }

    setTargetCurrency(targetCurrency) {
        const state = {
            targetCurrency,
            rate: undefined
        };
        if (targetCurrency === this.props.sourceCurrency) {
            state.sourceCurrency = this.props.targetCurrency;
        }
        this.props.update(state);
    }

    setTargetAmount(targetAmount) {
        const state = {
            targetAmount,
            offer: false
        };
        if (!targetAmount) {
            state.sourceAmount = undefined;
            state.fee = undefined;
        }
        this.props.update(state);
    }

    getExchangeRate() {
        if (!this.exchangeRateUpdater) {
            this.exchangeRateUpdater = new ExchangeRateUpdater(this.props.update);
        }
        const exchangeRequest = createExchangeRequest(this.props);
        this.exchangeRateUpdater.start(exchangeRequest);
    }

    swap() {
        this.props.update({
            sourceCurrency: this.props.targetCurrency,
            sourceAmount: this.props.targetAmount,
            targetCurrency: this.props.sourceCurrency,
            targetAmount: this.props.sourceAmount,
            offer: !this.props.offer,
            rate: undefined,
            fee: undefined
        });
    }
}

function createExchangeRequest({ sourceCurrency, sourceAmount, targetCurrency, targetAmount, offer }) {
    const exchangeRequest = {
        sourceCurrency,
        targetCurrency
    };

    if (offer) {
        exchangeRequest.sourceAmount = convertToNumber(sourceAmount);
    } else {
        exchangeRequest.targetAmount = convertToNumber(targetAmount);
    }

    return exchangeRequest;
}

function convertToNumber(amount) {
    return amount === undefined ? 0 : Number(amount);
}

function getBalance(balances, currency) {
    const balance = balances.find(balance => balance.currency === currency);
    return balance ? balance.amount : 0;
}

// Dummy exchange.
function exchange(state) {
    return {
        ...state,
        balances: state.balances.map(balance => {
            if (balance.currency === state.sourceCurrency) {
                return {
                    ...balance,
                    amount: balance.amount - Number(state.sourceAmount)
                };
            }

            if (balance.currency === state.targetCurrency) {
                return {
                    ...balance,
                    amount: balance.amount + Number(state.targetAmount)
                };
            }

            return balance;
        })
    };
}

export default connect(state => ({
    sourceCurrency: state.sourceCurrency,
    sourceAmount: state.sourceAmount,
    targetCurrency: state.targetCurrency,
    targetAmount: state.targetAmount,
    sourceBalance: getBalance(state.balances, state.sourceCurrency),
    targetBalance: getBalance(state.balances, state.targetCurrency),
    rate: state.rate,
    fee: state.fee,
    offer: state.offer
}), {
    update,
    exchange
})(ExchangeWidgetComponent)
