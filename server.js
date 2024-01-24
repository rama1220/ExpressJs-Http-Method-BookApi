import app from './app.js'
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.APP_PORT

app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})