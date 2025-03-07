import { Request, Response } from "express";
import { UserBusiness } from "../business/UserBusiness";
import { ZodError } from "zod";
import { BaseError } from "../error/BaseError";
import { SignupSchema } from "../dtos/user/signup.dto";
import { LoginSchema } from "../dtos/user/login.dto";

export class UserController {
    constructor(
        private userBusiness: UserBusiness
    ) { }

    public signup = async (req: Request, res: Response) => {
        try {
            const input = SignupSchema.parse({ //const input: SignupInputDTO
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })

            const output = await this.userBusiness.signup(input)
            res.status(201).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)//propriedade que contém os detalhes do erro
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
    public login = async (req:Request, res:Response) => {
        try {

            const input = LoginSchema.parse({
                email: req.body.email,
                password: req.body.password
            })

            const output = await this.userBusiness.login(input)
            res.status(200).send(output)
              
        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)//propriedade que contém os detalhes do erro
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}