import test from 'node:test';import assert from 'node:assert/strict';
import {stockViewModel,formatPrice} from '../../work/web/view-model.mjs';
for (const [qty,label,kind,canBuy] of [[0,'Épuisé','out',false],[1,'Plus que 1 !','low',true],[3,'Plus que 3 !','low',true],[4,'En stock','ok',true],[12,'En stock','ok',true]]){
 test(`M4 — stock ${qty}: libellé, style et achat cohérents`,()=>{
  const value=stockViewModel(qty);assert.deepEqual(value,{label,kind,canBuy});
 });
}
test('M4 — prix affiché en euros',()=>{
 const result=formatPrice(2990);assert.match(result,/29,90/);assert.match(result,/€/);
});
