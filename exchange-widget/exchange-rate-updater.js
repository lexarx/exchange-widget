import { getExchangeRate } from './exchange';

export default class ExchangeRateUpdater {
    constructor(setExchangeRate) {
        this.setExchangeRate = setExchangeRate;
        this.lastUpdateNumber = 0;
    }

    start(exchangeRequest) {
        if (this.exchangeRequest && isSameRequest(this.exchangeRequest, exchangeRequest)) {
            return;
        }

        this.exchangeRequest = exchangeRequest;
        this.stop();
        this.started = true;
        this.updated = false;
        this.update();
        this.intervalId = setInterval(() => this.update(), 10000);
    }

    async update() {
        if (!this.started) {
            return;
        }

        const updateNumber = ++this.lastUpdateNumber;
        const exchangeRate = await getExchangeRate(this.exchangeRequest);
        if (exchangeRate.error) {
            return;
        }

        if (!this.updated || updateNumber === this.lastUpdateNumber) {
            this.setExchangeRate(exchangeRate);
            this.updated = true;
        }
    }

    stop() {
        this.started = false;
        clearInterval(this.intervalId);
    }
}

function isSameRequest(request1, request2) {
    return request1.sourceAmount === request2.sourceAmount &&
        request1.sourceCurrency === request2.sourceCurrency &&
        request1.targetAmount === request2.targetAmount &&
        request1.targetCurrency === request2.targetCurrency;
}
