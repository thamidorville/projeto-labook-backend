import { type } from 'os'
import z from 'zod'
import { PostModel } from '../../models/Post'


export interface getPostInputDTO {
token: string
}

export type getPostOutputDTO = PostModel[]


export const GetPostSchema = z.object({
 
    token: z.string().min(1)
}).transform(data => data as getPostInputDTO)