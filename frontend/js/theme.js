const THEME_KEY="jkq_theme";

function applyTheme(theme){
 const mode=theme==="dark"?"dark":"light";
 document.body.dataset.theme=mode;
 const btn=document.getElementById("themeToggle");
 if(btn){
  const label=mode==="dark"?"Switch to light mode":"Switch to dark mode";
  btn.textContent=mode==="dark"?"☀️ Light":"🌙 Dark";
  btn.setAttribute("aria-label",label);
 }
}

document.addEventListener("DOMContentLoaded",()=>{
 const savedTheme=localStorage.getItem(THEME_KEY)||"light";
 applyTheme(savedTheme);
 const themeToggle=document.getElementById("themeToggle");
 if(themeToggle){
  themeToggle.onclick=()=>{
   const next=document.body.dataset.theme==="dark"?"light":"dark";
   localStorage.setItem(THEME_KEY,next);
   applyTheme(next);
  };
 }
});
