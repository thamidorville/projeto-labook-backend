import { UserDB } from "../models/User";
import { BaseDatabase } from "./BaseDatabase";

export class UserDatabase extends BaseDatabase{
    public static TABLE_USERS = "users"

    //métodos do banco de dados
    public insertUser = async (userDB: UserDB): Promise<void> => {
        await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)//obtem conexao com o banco de dados
        .insert(userDB)//insere um novo usuário no banco de dados
    }

    public findUserByEmail = async (email:string):Promise<UserDB | undefined> => {
        //const [ userDB]: Array<UserDB | undefined> = ...
        const [ userDB ] = await BaseDatabase //o knex sempre devolve um array
        .connection(UserDatabase.TABLE_USERS)
        .select()
        .where({ email })

        return userDB as UserDB | undefined
    }



}