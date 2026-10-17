'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty"><h1>A little pause.</h1><p>Something interrupted this page. Please try again.</p><button className="btn" onClick={reset}>Try again</button></div>;}
