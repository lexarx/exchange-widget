import React from 'react'
import { connect } from './store'
import currencySymbols from './currency-symbols'
import classNames from 'classnames'
import styles from './exchange-widget.css'

function ExchangeElement({ source, currency, amount, balance, fee, currencies, setCurrency, setAmount }) {
    const className = classNames(
        styles.exchangeElement,
        source && styles.source
    );
    const balanceClassNames = classNames(
        styles.balance,
        source && amount > balance && styles.insufficientBalance
    );
    const amountInputValue = formatAmount(amount, source);
    return (
        <div className={className}>
            <div className={styles.leftColumn}>
                <select
                    value={currency}
                    onChange={event => setCurrency(event.target.value)}
                    className={styles.currencySelect}
                >
                    {currencies.map(currency => <option value={currency} key={currency}>{currency}</option>)}
                </select>
                <div
                    className={balanceClassNames}
                    onClick={() => setAmount(balance)}
                >
                    Balance: {currencySymbols[currency]}{balance.toFixed(2)}
                </div>
            </div>
            <div className={styles.rightColumn}>
                <input
                    type="text"
                    placeholder="0"
                    value={amountInputValue}
                    className={styles.amountInput}
                    onChange={event => setAmount(getValidNumberPrefix(event.target.value, amountInputValue))}
                    onSelect={preventSignSelection}
                />
                {displayFee(fee)}
            </div>
        </div>
    );
}

function formatAmount(amount, source) {
    if (amount === undefined) {
        return '';
    }

    if (amount === 0) {
        return '';
    }

    if (!Number(amount)) {
        return amount;
    }

    if (typeof amount === 'number') {
        amount = amount.toFixed(2);
    }

    const sign = source ? '-' : '+';
    return `${sign} ${amount}`;
}

function displayFee(fee) {
    if (!fee || !fee.amount) {
        return;
    }

    const currencySymbol = currencySymbols[fee.currency];
    return <div className={styles.fee}>Inc. fee: {currencySymbol}{fee.amount.toFixed(2)}</div>;
}

function preventSignSelection(event) {
    const input = event.target;
    if (/^[+-] /.test(input.value) && input.selectionStart < 2) {
        input.selectionStart = 2;
    }
}

function getValidNumberPrefix(text, previousValue) {
    if (/^\./.test(text)) {
        text = '';
    }
    text = text.replace(/[^\d.]/g, '');
    text = text.replace(/^0[^.]+/, '0');
    const parts = text.split('.').slice(0, 2);
    if (parts[0].length > 10) {
        const previousNumber = previousValue.replace(/^[+-] /, '');
        return limitNumber(previousNumber);
    }

    if (parts.length > 1) {
        parts[1] = parts[1].substr(0, 2);
    }
    text = parts.join('.');
    return text;
}

function limitNumber(number) {
    const parts = number.split('.');
    if (parts[0].length > 10) {
        parts[0] = parts[0].substr(0, 10);
    }
    return parts.join('.');
}

export default connect(state => ({
    currencies: state.balances.map(balance => balance.currency)
}))(ExchangeElement)
