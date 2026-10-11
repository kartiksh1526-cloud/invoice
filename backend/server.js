const express=require("express");
const path=require("path");
const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"../frontend")));
app.get("/api/health",(req,res)=>res.json({ok:true,service:"JK Quotation System"}));
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"../frontend/login.html")));
const PORT=process.env.PORT||3000;
if(require.main===module){
 app.listen(PORT,()=>console.log(`JK Quotation System running on http://localhost:${PORT}`));
}
module.exports=app;