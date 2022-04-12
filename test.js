const puppeteer = require('puppeteer');
const { expect }  = require('chai');
const laptops = require('./laptops.json');


let URL ="http://127.0.0.1:8080/index.html";

const HEADLESS = true;
const TIMEOUT = 12000;

let browser;
let page;

const {nvidia, amd, intel} = sieve();
  
const rand_nvidia = nvidia[getRandomInt(0, nvidia.length)];
const rand_amd = amd[getRandomInt(0, amd.length)];
const rand_intel = intel[getRandomInt(0, intel.length)];

before(async function(){
  this.timeout(TIMEOUT);
  browser = await puppeteer.launch({headless: HEADLESS,  defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 800});
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.emulateMediaType("screen");
  await page.goto(URL, { waitUntil: 'networkidle2'});
});

function pause(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("resolved");
    }, timeout);
  });
}


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

function sieve(){
  let nvidia=[], amd=[], intel=[];
  for (let laptop of laptops){
    if(laptop.graphics_brand === 'NVIDIA')nvidia.push(laptop);
    if(laptop.graphics_brand === 'AMD')amd.push(laptop);
    if(laptop.graphics_brand === 'Intel')intel.push(laptop);
  }

  return {nvidia, amd, intel};
}

async function tableCheck(searchKey){
  let result = await getHTML('#result');

  let checks = {
    brand: false,
    graphics_brand: false,
    processor_brand: false,
    price: false
  };

  for(let key of Object.keys(checks)){
    checks[key] = result.search(searchKey[key]) != -1;
  }

  expect(checks).to.eql({
    brand: true,
    graphics_brand: true,
    processor_brand: true,
    price: true
  });
}

context('Assignment 3.1', ()=>{

  describe('Test Suite 1: When the page loads', ()=>{

    checkElements({
      'Test case 1: The table should have the appropriate HTML table elements': 'table>thead+tbody>tr>td',
      'Test case 2: The table body should have 5 columns': 'table>tbody>tr>td:nth-child(5)',
      'Test case 3: The table should have 205 rows': ' table>tbody>tr:nth-child(204)'
    })

  });

  describe('Test Suite 2: The Nvidia Button', () => {

    it('Test case 1: The table should have exactly 71 rows after the nvidia button is clicked', async () => {
      await page.click('button#nvidia-btn');
    
      let links = await page.$$('tbody tr');
      expect(links.length).to.equal(71);
    });

    it('Test case 2: The content of the count span should be exactly 71 after the nvidia button is clicked', async () => {
      await page.click('button#nvidia-btn');
    
      expect(await getInnerText('#count')).to.eql('71')
    });
    
    it(`Test 3: Should have the record ${rand_nvidia.name}  ${rand_nvidia.graphics_brand} in the table`, async ()=>{
      await page.click('button#nvidia-btn');
      await tableCheck(rand_nvidia);
    });
  
  });

  describe('Test Suite 3: The AMD Button', () => {

    it('Test case 1: The table should have exactly 26 rows after the amd button is clicked', async () => {
      await page.click('button#amd-btn');
    
      let links = await page.$$('tbody tr');
      expect(links.length).to.equal(26);
    });

    it('Test case 2: The content of the count span should be exactly 26 after the amd button is clicked', async () => {
      await page.click('button#amd-btn');
    
      expect(await getInnerText('#count')).to.eql('26')
    });
    
    it(`Test 3: Should have the record ${rand_amd.name}  ${rand_amd.graphics_brand} in the table`, async ()=>{
      await page.click('button#amd-btn');
      await tableCheck(rand_amd);
    });
  
  });

  describe('Test Suite 4: The Intel Button', () => {

    it('Test case 1: The table should have exactly 101 rows after the intel button is clicked', async () => {
      await page.click('button#intel-btn');
    
      let links = await page.$$('tbody tr');
      expect(links.length).to.equal(101);
    });

    it('Test case 2: The content of the count span should be exactly 101 after the intel button is clicked', async () => {
      await page.click('button#intel-btn');
    
      expect(await getInnerText('#count')).to.eql('101')
    });
    
    it(`Test 3: Should have the record ${rand_intel.name}  ${rand_intel.graphics_brand} in the table`, async ()=>{
      await page.click('button#intel-btn');
      await tableCheck(rand_intel);
    });
  
  });

});

after(async () => {
  await browser.close();
});