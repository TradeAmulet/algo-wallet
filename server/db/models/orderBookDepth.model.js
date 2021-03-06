const  mongoose = require('mongoose');
const { autoIncrement } = require('../db')

const Schema = mongoose.Schema

const OrderBookDepthModel = new Schema({
    time: { type: Date, default: Date.now },
    highestBid: String,
    lowestAsk: String,
    btcTranches: Object,
    ethTranches: Object,
    percentageTrances: Object
})

const OrderBookDepth = mongoose.model( 'OrderBookDepth', OrderBookDepthModel )

module.exports = OrderBookDepth