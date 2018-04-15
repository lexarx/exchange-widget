import ExchangeWidget from './exchange-widget/exchange-widget'

const container = document.getElementById('exchange-widget-container');
const exchangeWidget = new ExchangeWidget();
exchangeWidget.setBalances([
    {
        currency: 'GBP',
        amount: 8333
    },
    {
        currency: 'EUR',
        amount: 200
    },
    {
        currency: 'USD',
        amount: 0
    }
]);
exchangeWidget.render(container);
