import z from 'zod'

export interface SignupInputDTO {
name: string,
email: string,
password: string
}

export interface SignupOutputDTO {
    token: string
}
    //validação de como as informações precisam entrar
export const SignupSchema = z.object({
    name: z.string().min(2), //mínimo 2 caracteres para o dado de entrada name
    email: z.string().email(),
    password: z.string().min(4)//mínimo de 4 caracteres pra senha
}).transform(data => data as SignupInputDTO)//método para transformar os dados
//de entrada em um objeto SignupInputDTO