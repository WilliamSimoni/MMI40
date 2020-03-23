const request = require('supertest')
const { app } = require('./testStubIndex')

function postBody(projectName, device, keyword, aggrFun, timePeriod, granularity, store) {
    const request = {
        projectName: projectName,
        device: device,
        keyword: keyword,
        aggregationFunction: aggrFun,
        timePeriod: timePeriod,
        granularity: granularity,
        store: store
    }
    return request;
}

describe('Right Post Body', () => {
    it('everything is sent in a normal format', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(300);
    });
    it('data sent whit spaces and periods', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum.', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(300);
    });
})

describe('Wrong Post Body', () =>{
    it('send nothing', async () =>{
        const res = await request(app)
            .post('/get')
            .send(null);    
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send partial object without store flag', async () =>{
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10));    
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
});

describe('Wrong Project Name', () =>{
    it('send a number instead of a string as project name', async () =>{
        const res = await request(app)
            .post('/get')
            .send(postBody(12, ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10));    
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send only white spaces and punctuation as project name', async () =>{
        const res = await request(app)
            .post('/get')
            .send(postBody('  ,,.?/', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10));    
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
});

describe('Wrong device property', () => {
    it('send a string instead of an array as device', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', 'device 1', ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send array with not only strings', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2', 13], ['temperature'], { name: 'sum.', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})

describe('Wrong Keyword Property', () => {
    it('send a string instead of an array as keyword', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], 'temperature', { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send array with not only strings', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature', {keyword:'pression'}], { name: 'sum.', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})


describe('Wrong aggregation function Property', () => {
    it('send non supported or wrong function name', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'somma', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send wrong code', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum.', code: -1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send more than one name as function name', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum max', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})

describe('send wrong time period case 1', () => {
    it('send wrong time period key', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'mese', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send more than one key name', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum.', code: 1 }, { key: 'month year', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send number < 0', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum.', code: 1 }, { key: 'month', number: -1 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})

describe('send wrong time period case 2', () => {
    it('send wrong unit', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { start:123242, end: 132132, unit:'h' }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send granularity as string and time period case 2 is not allowed', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { start:123242, end: 132132, unit:'h' }, 'month', false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})

describe('granularity tests', () => {
    it('send granularity < 0', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { start:123242, end: 132132, unit:'s' }, -1, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('send wrong granularity key ', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: -1 }, 'mese', false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})

/*
describe('Right Post Body', () => {
    it('everything is sent in a normal format', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody('Pierucci', ['device1', 'device2'], ['temperature'], { name: 'sum', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
    it('data sent whit spaces and periods', async () => {
        const res = await request(app)
            .post('/get')
            .send(postBody(' Pierucci ', ['device 1', 'device 2'], ['temperature'], { name: 'sum.', code: 1 }, { key: 'month', number: 24 }, 10, false));
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
    });
})
*/