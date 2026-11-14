type ClarityQueue=((...args:unknown[])=>void)&{q?:unknown[][]};
declare global {interface Window {clarity?:ClarityQueue;}}
export function installClarity():void {
 if(document.getElementById('research-clarity-tag'))return;
 if(!window.clarity){const queue:ClarityQueue=(...args)=>{(queue.q??=[]).push(args);};window.clarity=queue;}
 const script=document.createElement('script');script.id='research-clarity-tag';script.async=true;script.src='https://www.clarity.ms/tag/zdmf64alc5';document.head.appendChild(script);
}
