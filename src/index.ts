import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { userRouter } from './router/userRouter'
import { postRouter } from './router/postRouter'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.listen(Number(process.env.PORT) || 3003, () => {
    console.log(`Servidor rodando na porta ${Number(process.env.PORT) || 3003}`)
})

// routers das entidades

//criando o middleware 
app.use("/users", userRouter) //a requisição será enviada para userRouter
app.use("/posts", postRouter)


app.get("/ping", (req, res) => {
res.send("Pong pong!!")
})


