import { UserDatabase } from "../database/UserDatabase";
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto";
import { BadRequestError } from "../error/BadRequestError";
import { TokenPayload, USER_ROLES, User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness { //cuida das regras de negócio
    constructor (
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager

    ){}

    public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {
       const { name, email, password} = input
       
        const id = this.idGenerator.generate() 
        
        //para não instanciar com a senha do user
        const hashedPassword = await this.hashManager.hash(password)

        const user = new User(
            id, 
            name, 
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
            )
            const userDB = user.toDBModel()
            await this.userDatabase.insertUser(userDB)

            const payLoad: TokenPayload = {
                id: user.getId(),
                name: user.getName(),
                role: user.getRole()

            } 

            const token = this.tokenManager.createToken(payLoad)

            const output: SignupOutputDTO = {
                token
            }
            return output
    }
    public login = async (input: LoginInputDTO):Promise<LoginOutputDTO> => {
        const { email, password } = input

        const userDB = await this.userDatabase.findUserByEmail(email)

        if(!userDB){
            throw new BadRequestError("email ou senha inválidos")
        }
        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )
            const hashedPassword = user.getPassword()

        //verifica se a senha enviada é a mesma armazenada no banco de dados
        const isPasswordCorrect = await this.hashManager
        .compare(password, hashedPassword)//'compare' método que compara as 
        //senhas criptografadas para verificar se são as mesmas

        if (!isPasswordCorrect){
            throw new BadRequestError("email ou senha inválidos")
        }

        const payload: TokenPayload = {
            id: user.getId(),
            name:user.getName(),
            role:user.getRole()
        }

        const token = this.tokenManager.createToken(payload)

        const output: LoginOutputDTO = {
            token
        }

        return output
    }
}