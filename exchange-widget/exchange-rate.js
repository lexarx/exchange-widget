import React from 'react'
import currencySymbols from './currency-symbols'
import styles from './exchange-widget.css'

export default function({ rate, sourceCurrency, targetCurrency }) {
    return <div className={styles.exchangeRate}>{displayRate(rate, sourceCurrency, targetCurrency)}</div>;
}

function displayRate(rate, sourceCurrency, targetCurrency) {
    if (!rate) {
        return;
    }

    const sourceSymbol = currencySymbols[sourceCurrency];
    const targetSymbol = currencySymbols[targetCurrency];
    const targetAmount = rate.toFixed(4);
    return `1${sourceSymbol} = ${targetSymbol}${targetAmount}`;
}
