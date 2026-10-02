(function(root){
const normalize=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/å/g,'aa').replace(/æ/g,'ae').replace(/ø/g,'oe').replace(/[.,–-]/g,' ').replace(/\s+/g,' ').trim();
function findDepartments(departments,city,address){
 const cityQuery=normalize(city);const street=normalize(String(address).split(/\d/)[0]);const number=String(address).match(/\d+/)?.[0];
 if(!cityQuery||street.length<2)return [];
 return departments.filter(d=>{
  const cityMatches=[d.city,d.zip,...d.addresses.flatMap(a=>[a.city,a.zip])].some(c=>normalize(c)===cityQuery)||normalize(d.name).includes(' '+cityQuery+' ' )||normalize(d.name).endsWith(' '+cityQuery);
  if(!cityMatches)return false;
  if(!d.addresses.some(a=>normalize(a.street).includes(street))&&!normalize(d.name).includes(street))return false;
  // Published labels describe house-number ranges; never extrapolate odd/even sides.
  // Always ask the resident to confirm the published address range before saving.
  if(number){
   const title=normalize(d.name);const start=title.indexOf(street);if(start>=0){
    const original=d.name.toLowerCase();const streetLiteral=String(address).split(/\d/)[0].trim().toLowerCase();const at=original.indexOf(streetLiteral);
    if(at>=0){const segment=original.slice(at+streetLiteral.length).split(/\s+-\s+/)[0];const ranges=[...segment.matchAll(/(\d+)\s*(?:[-–]\s*(\d+))?/g)];if(ranges.length&&!ranges.some(m=>Number(number)>=Number(m[1])&&Number(number)<=Number(m[2]||m[1])))return false;}
   }
  }
  return true;
 });
}
root.ResidentAddress={normalize,findDepartments};if(typeof module!=='undefined')module.exports=root.ResidentAddress;
})(typeof window!=='undefined'?window:globalThis);
