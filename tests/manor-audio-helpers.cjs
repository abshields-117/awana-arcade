'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function factory(){const html=fs.readFileSync(require('node:path').join(__dirname,'../games/phantom_manor.html'),'utf8');const script=html.match(/<script id="manor-audio">([\s\S]*?)<\/script>/);assert.ok(script);const window={};vm.runInNewContext(script[1],{window});return window.createManorAudio;}
function fake(){const starts=[],nodes=[];const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});const ac={currentTime:0,state:'suspended',destination:{},resume(){this.state='running';return Promise.resolve();},suspend(){this.state='suspended';return Promise.resolve();},createGain(){return {gain:param(),connect(){},disconnect(){}};},createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(t){starts.push(t);},stop(){}};nodes.push(o);return o;}};return {ac,starts,nodes};}
module.exports={factory,fake};
