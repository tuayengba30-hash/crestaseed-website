const allowed = new Set(['Strategic Partnership','Investment Opportunities','Agricultural Collaboration','Housing Development','Education and Skills Development','Business and Commercial Opportunities','General Inquiry']);
export async function onRequestPost({request,env}) {
  const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
  const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers});
  if(!env.RESEND_API_KEY||!env.CONTACT_TO_EMAIL||!env.CONTACT_FROM_EMAIL)return respond({error:'Contact service not configured'},503);
  let body;try{body=await request.json()}catch{return respond({error:'Invalid request'},400)}
  if(body.company_website)return respond({ok:true});
  const name=String(body.name||'').trim(), email=String(body.email||'').trim(), interest=String(body.interest||'').trim(), message=String(body.message||'').trim();
  if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!allowed.has(interest)||message.length<10||message.length>5000)return respond({error:'Please check the required fields'},400);
  const safe=(x)=>x.replace(/[\r\n]/g,' ');
  try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.CONTACT_FROM_EMAIL,to:[env.CONTACT_TO_EMAIL],subject:'CrestaSeed inquiry: '+safe(interest),reply_to:email,text:'Name: '+name+'\nEmail: '+email+'\nInterest: '+interest+'\n\n'+message})});if(!r.ok)return respond({error:'Email delivery failed'},502);return respond({ok:true});}catch{return respond({error:'Service temporarily unavailable'},503)}
}
