import z from 'zod'

export interface DeletePostInputDTO {
    token: string,
    idToDelete:string
}

export type DeleteOutputDTO = undefined


export const DeletePostSchema = z.object({
    token: z.string().min(1),
    idToDelete:z.string().min(1)
})