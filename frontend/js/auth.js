const LOGIN_KEY="jkq_logged_in";
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

function requireLogin(){if(!localStorage.getItem(LOGIN_KEY)) location.href="login.html";}

document.addEventListener("DOMContentLoaded",()=>{
 const savedTheme=localStorage.getItem(THEME_KEY)||"light";
 applyTheme(savedTheme);
 const form=document.getElementById("loginForm");
 if(form) form.addEventListener("submit",e=>{e.preventDefault();const u=document.getElementById("username").value,p=document.getElementById("password").value;
 if(u==="admin"&&p==="admin123"){localStorage.setItem(LOGIN_KEY,"1");location.href="dashboard.html"}else alert("Invalid demo login.")});
 const logout=document.getElementById("logoutBtn"); if(logout) logout.onclick=()=>{localStorage.removeItem(LOGIN_KEY);location.href="login.html"};
 const themeToggle=document.getElementById("themeToggle"); if(themeToggle){themeToggle.onclick=()=>{const next=document.body.dataset.theme==="dark"?"light":"dark";localStorage.setItem(THEME_KEY,next);applyTheme(next);};}
 if(!location.pathname.endsWith("login.html")) requireLogin();
});