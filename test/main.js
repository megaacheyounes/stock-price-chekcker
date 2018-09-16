"use strict";
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let should = chai.should();
let server = require('../server.js');
let ROUTE = '/api/stock-prices?';



describe('get stock data', () => {

    it('should return stock data', done => {
        let STOCK = 'msft';
        let r = ROUTE + 'stock=' + STOCK;
        chai.request(server).get(r).end((req, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('stockData');
            res.body.stockData.should.have.property('stock').eql(STOCK);
            res.body.stockData.should.have.property('price');
            res.body.stockData.should.have.property('likes');
            done();
        })
    })
    it('should like and return stock data', done => {
        let STOCK = 'msft';
        let r = ROUTE + 'stock=' + STOCK + '&like=true';
        chai.request(server).get(r).end((req, res) => {

            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('stockData');
            res.body.stockData.should.have.property('stock').eql(STOCK);
            res.body.stockData.should.have.property('price');
            res.body.stockData.should.have.property('likes');
            done();
        })
    })


    it('should return stocks data ', done => {
        let STOCK1 = 'msft';
        let STOCK2 = 'goog';
        let r = ROUTE + 'stock=' + STOCK1 + '&stock=' + STOCK2;
        chai.request(server).get(r).end((req, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('stockData');
            res.body.stockData.should.be.a('array');
            res.body.should.have.nested.property('stockData[0].stock');
            res.body.should.have.nested.property('stockData[0].price');
            res.body.should.have.nested.property('stockData[0].rel_likes');
            res.body.should.have.nested.property('stockData[1].stock');
            res.body.should.have.nested.property('stockData[1].price');
            res.body.should.have.nested.property('stockData[1].rel_likes');

            res.body.should.have.nested.property('stockData[1].rel_likes')
                .eql(0 - res.body.stockData[0].rel_likes);

            done();
        })
    })

})