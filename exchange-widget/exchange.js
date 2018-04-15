const APP_ID = '7487a0c8df864b609b0e0575731a6757';

/**
 * Dummy exchange with a fee.
 * Accepts either the amount to exchange or the amount to receive after exchange.
 */
export async function getExchangeRate({ sourceAmount, sourceCurrency, targetAmount, targetCurrency }) {
    try {
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${APP_ID}` +
            `&symbols=${sourceCurrency},${targetCurrency}`, { cache: 'no-cache' });
        if (!response.ok) {
            return { error: true };
        }

        const openExchangeResponse = await response.json();
        if (openExchangeResponse.error) {
            return { error: true };
        }

        return createDummyResponse({
            sourceAmount,
            sourceCurrency,
            targetAmount,
            targetCurrency,
            openExchangeResponse
        });
    } catch (error) {
        return { error: true };
    }
}

function createDummyResponse({ sourceAmount, sourceCurrency, targetAmount, targetCurrency, openExchangeResponse }) {
    const rate = openExchangeResponse.rates[targetCurrency] / openExchangeResponse.rates[sourceCurrency];
    const response = { rate };

    if (sourceAmount === undefined) {
        const fee = getExchangeFee(targetAmount / rate, sourceCurrency);
        response.sourceAmount = targetAmount / rate + fee.amount;
        response.fee = fee;
    }

    if (targetAmount === undefined) {
        const fee = getExchangeFee(sourceAmount, targetCurrency);
        response.targetAmount = sourceAmount * rate - fee.amount;
        response.fee = fee;
    }

    return response;
}

function getExchangeFee(amount, currency) {
    if (amount < 5000) {
        return {
            amount: 0,
            currency
        };
    }

    return {
        amount: amount * 0.01,
        currency
    };
}
