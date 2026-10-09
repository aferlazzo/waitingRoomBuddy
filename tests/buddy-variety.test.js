const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const {topics, createMemory} = require('../buddy-variety');

function storage() {
  const values = new Map();
  return {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
}
test('all subjects are explored once, including across visits; next cycle avoids recent subjects', () => {
  const saved = storage();
  const seen = [];
  for (let i = 0; i < topics.length; i++) {
    const memory = createMemory(saved);
    const id = memory.next();
    assert.ok(!seen.includes(id));
    seen.push(id);
    memory.remember(id, 'Story '+id);
  }
  const memory = createMemory(saved);
  assert.ok(!seen.slice(-8).includes(memory.next()));
  assert.equal(memory.recent().length, 30);
});
test('storage failures and malformed data retain usable session memory', () => {
  const memory = createMemory({getItem: () => '{bad', setItem: () => {throw Error('blocked');}}, () => 0);
  memory.remember(memory.next(), 'Already read');
  assert.equal(memory.next(), 1);
  assert.deepEqual(memory.recent(), ['Already read']);
});
test('server constrains subject and prior context, excludes octopus, and preserves errors', async () => {
  let request;
  const mod = {exports:{}};
  const context = {
    require: () => ({topics}), exports: mod.exports, process:{env:{OPENAI_API_KEY:'test'}}, console:{log(){},error(){}},
    fetch: async (_, opts) => {request=JSON.parse(opts.body);return {ok:true,status:200,text:async()=>JSON.stringify({output_text:'A new story'})};}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../netlify/functions/buddy.js'),'utf8'), context);
  const result = await mod.exports.handler({httpMethod:'POST',body:JSON.stringify({mode:'interesting',topicId:2,recentStories:['Old story',123]})});
  assert.equal(JSON.parse(result.body).topicId,2);
  const prompt=request.input[1].content;
  assert.ok(prompt.includes(topics[2]));
  assert.ok(prompt.includes('Never use octopus'));
  assert.ok(prompt.includes('Old story'));
  assert.ok(!prompt.includes('123'));
  context.fetch=async()=>({ok:false,status:429,text:async()=>JSON.stringify({error:{message:'Quota exhausted',code:'insufficient_quota'}})});
  const error=await mod.exports.handler({httpMethod:'POST',body:'{}'});
  assert.equal(error.statusCode,429);
  assert.equal(JSON.parse(error.body).error,'Quota exhausted');
});
test('UI sends history, blocks concurrent clicks, and retains memory on Start over', async () => {
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const elements = Object.fromEntries(['title','text','controls'].map(id=>[id,{}]));
  let release, requests=0, body;
  const saved=storage();
  saved.setItem('wrb-ai-usage-v1', JSON.stringify({date:new Date().toISOString().slice(0,10),count:20}));
  const context={WRBVariety:{createMemory},localStorage:saved,document:{getElementById:id=>elements[id],querySelectorAll:()=>[],createElement:()=>({set textContent(v){this.innerHTML=v;}})},fetch:async(_,opts)=>{requests++;body=JSON.parse(opts.body);await new Promise(resolve=>release=resolve);return {ok:true,text:async()=>JSON.stringify({text:'Fresh story'})};}};
  vm.createContext(context);vm.runInContext(script,context);
  const first=context.askBuddy('interesting');
  await context.askBuddy('surprise');
  assert.equal(requests,1);
  assert.deepEqual(body.recentStories,[]);
  const firstId=body.topicId;
  release();await first;
  context.resetBuddy();
  const second=context.askBuddy('surprise');
  assert.notEqual(body.topicId,firstId);
  assert.deepEqual(body.recentStories,['Fresh story']);
  release();await second;
  assert.equal(context.buddyBusy,false);
  // A previous exhausted daily counter cannot lock this device out.
  assert.equal(requests,2);
});
test('more than twenty successful responses are allowed and a failed request can be retried', async () => {
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const elements=Object.fromEntries(['title','text','controls'].map(id=>[id,{}]));
  let calls=0, fail=true;
  const context={WRBVariety:{createMemory},localStorage:storage(),document:{getElementById:id=>elements[id],querySelectorAll:()=>[],createElement:()=>({set textContent(v){this.innerHTML=v;}})},fetch:async()=>{
    calls++;
    return fail ? {ok:false,status:429,text:async()=>'<html>Too many requests</html>'} : {ok:true,status:200,text:async()=>JSON.stringify({text:'A useful reply '+calls})};
  }};
  vm.createContext(context);vm.runInContext(script,context);
  await context.askBuddy('interesting');
  assert.ok(elements.text.innerHTML.includes('wait a few minutes'));
  assert.equal(context.buddyMemory.recent().length,0);
  fail=false;
  for(let i=0;i<25;i++)await context.askBuddy('interesting');
  assert.equal(calls,26);
  assert.equal(context.buddyMemory.recent().length,25);
  assert.equal(context.buddyBusy,false);
});
