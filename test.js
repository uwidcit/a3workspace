const puppeteer = require('puppeteer');
const { expect }  = require('chai');
const laptops = require('./laptops.json');


let URL ="http://127.0.0.1:8080/index.html";

const HEADLESS = true;
const TIMEOUT = 12000;

let browser;
let page;

  

before(async function(){
  this.timeout(TIMEOUT);
  browser = await puppeteer.launch({headless: HEADLESS,  defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 800});
 

  await page.emulateMediaType("screen");
  await page.goto(URL, { waitUntil: 'networkidle2'});
});


function checkElements(elements){
  for(let [name, ele] of Object.entries(elements)){
    it(`${name}`, async()=>{
      expect(await page.$(ele)).to.be.ok;
    });
  }
}

function getInnerText(selector){
  return page.evaluate(selector=>document.querySelector(selector).innerText, selector);
}

function getHTML(selector){
  return page.evaluate(selector=>{
    try{
      return document.querySelector(selector).outerHTML;
    }catch(e){
      return null;
    }
  }, selector);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compMaker(compareKey){
    return function (a, b){
        if(a[compareKey] === b[compareKey])
            return 0;
        else if(a[compareKey] > b[compareKey])
            return 1;
        else return -1
    }
}


async function sortCheck(sortKey){
    const column = {
        'name': 1,
        'processor_brand':4,
        'graphics_brand':3
    }
    let elements = await page.$$(`tbody > tr > td:nth-child(${column[sortKey]})`);
    const promises = elements.map(ele => ele.evaluate(n=>n.innerText));
    const results = await Promise.all(promises);
    
    if(results.length === 0) return false;
    
    const [prev, ...rest] = results;

    for (let text of rest){
        if(prev.trim() > text.trim()){
            console.log(prev, text , prev.trim() === '999', text.trim()==='1049', '1099' > '1024');
            return false;
        }
            
    }

    return true;
}


context('Assignment 3.2', ()=>{

  describe('Test Suite 1: When the page loads', ()=>{

    checkElements({
      'Test case 1: The table should have the appropriate HTML table elements': 'table>thead+tbody>tr>td',
      'Test case 2: The table body should have 5 columns': 'table>tbody>tr>td:nth-child(5)',
      'Test case 3: The table should have 205 rows': ' table>tbody>tr:nth-child(205)'
    })

  });

  describe('Test Suite 2: The Name Button', () => {

    it('Test case 1: The content of the #sort_key span should be exactly "name" ', async () => {
        await page.click('button#name-btn');
        const sort_key = await page.$('#sort_key');
        expect(await sort_key.evaluate(node => node.innerText)).to.equal('name');
 
    });
    
    it(`Test 2: Should sort the table by the name`, async ()=>{
      await page.click('button#name-btn');
      const res = await sortCheck('name');
      expect(res).to.true;
    });

    it(`Test 3: The table should have the same number of records after sorting`, async ()=>{
        let recs = await page.$$('tbody tr');
        expect(recs.length).to.equal(205);
    });
  
  });

  describe('Test Suite 3: The CPU Button', () => {

    it('Test case 1: The content of the #sort_key span should be exactly "processor_brand" ', async () => {
        await page.click('button#cpu-btn');
        const sort_key = await page.$('#sort_key');
        expect(await sort_key.evaluate(node => node.innerText)).to.equal('processor_brand');
 
    });
    
    it(`Test 2: Should sort the table by the processor_brand`, async ()=>{
      await page.click('button#cpu-btn');
      const res = await sortCheck('processor_brand');
      expect(res).to.true
    });

    it(`Test 3: The table should have the same number of records after sorting`, async ()=>{
        let recs = await page.$$('tbody tr');
        expect(recs.length).to.equal(205);
    });
  
  });

  describe('Test Suite 4: The GPU Button', () => {

    it('Test case 1: The content of the #sort_key span should be exactly "graphics_brand" ', async () => {
        await page.click('button#gpu-btn');
        const sort_key = await page.$('#sort_key');
        expect(await sort_key.evaluate(node => node.innerText)).to.equal('graphics_brand');
 
    });
    
    it(`Test 2: Should sort the table by the graphics_brand`, async ()=>{
      await page.click('button#gpu-btn');
      const res = await sortCheck('graphics_brand');
      expect(res).to.true
    });

    it(`Test 3: The table should have the same number of records after sorting`, async ()=>{
        let recs = await page.$$('tbody tr');
        expect(recs.length).to.equal(205);
    });
  
  });


});

after(async () => {
  await browser.close();
});